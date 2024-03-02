// NPM Dependencies
require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
app.use(helmet(), bodyParser.json());
const md5 = require('md5');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Custom Dependencies
const db = require('./db.js');
const authenticateUser = require('./authenticate.js');
const get360Image = require('./get360Image.js');
const failRequest = require('./utils/failRequest.js');
const validateBlockadeHeaders = require('./utils/validateBlockadeHeaders.js');
const validateUuid = require('./utils/validateUuid.js');

// Variables
const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);
const checkDbString = md5(process.env.CHECK_DB);

const TESTMODE = false;
app.get('/testMetaAuthentication', async (req, res) => {

  const { nonce, userId, } = req.query;
  if (!nonce || !userId) {
    failRequest(res);
  }
  else {
    await authenticateUser(axios, nonce, userId).then(async (result) => {
      if (result) {
        res.status(200).send("Authenticated!");
      }
      else {
        failRequest(res);
      }
    })
  }
});
app.get(`/userInfo`, async (req, res) => {
  const userId = req.query.userId;
  if(!userId){
    failRequest(res, 404);
  }
  else {
    await db.getUserData(userId).then((userInfo) => {
      if (userInfo) {
        res.status(200).send(userInfo);
      }
      else {
        failRequest(res, 400, { message: "User not found." });
      }
    })
  }
});
app.get(`/${checkDbString}`, async (req, res) => {
  const generationUuid = req.query.g;
  const checkDbKey = req.query.k;

  if(!validateUuid(generationUuid) || checkDbKey != process.env.CHECK_DB_KEY){
    console.log("Invalid key or uuid used in checkDb request.")
    failRequest(res, 404);
  }
  else {
    let generationData = await db.getGeneration(generationUuid);
    if (generationData) {
      res.status(200).send(generationData);
    }
    else {
      failRequest(res, 400, { message: "Generation not found." });
    }
  }
});

app.post(`/${sendGenerationString}`, async (req, res) => {
  const generationUuid = req.query.g;
  if(!validateBlockadeHeaders(req.headers) || !validateUuid(generationUuid)){
    failRequest(res, 404);
  }
  else {
    let uuidExists = await db.checkIfUuidExists(generationUuid);
    if (uuidExists) {
      let body = req.body;
      let status = body.status;
      console.log(`Webhook Hit by Blockade API, status "${status} for generation ID: ${generationUuid}`);
  
      if (status == "complete") {
        await db.saveBlockadeData(generationUuid, body);
      }
      res.status(200).send("Received Request:) - Thanks Blockade!");
    }
    else {
      failRequest(res, 404);
    }
  }
});

app.get(`/${endpointString}`, async (req, res) => {
  // Step 1: Request made to the server
  const { n: nonce, u: userId, p: prompt } = req.query;

  if (!nonce || !userId || !prompt) {
    failRequest(res);
  }

  console.log("Query Params Recieved: " + JSON.stringify(req.query));
  console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));

  // Step 2: Authenticate the user via Oculus API
  await authenticateUser(axios, nonce, userId).then(async (result) => {
    if (result) {
      console.log("Received user info, full access. Calling Blockade API");
      const generationUuid = uuidv4();
      await db.storeUuid(generationUuid, userId, prompt, TESTMODE);
      
      await get360Image(axios, prompt, generationUuid, TESTMODE).then(() => {
        if (TESTMODE){
          console.log("Sent User TEST Response")
          res.status(200).send({ generationId: "c52c73e3-4b9d-475b-863c-d2a10f8cb6b1"});
        }
        else{
          res.status(200).send({ generationId: generationUuid});
        }
      });
    }
    else {
      failRequest(res);
    }
  })
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;