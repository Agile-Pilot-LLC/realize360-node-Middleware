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

const TESTMODE = true;
app.get('/testMetaAuthentication', async (req, res) => {

  const { appId, appSecret, nonce, userId, prompt } = req.query;
  if (!appId || !appSecret || !nonce || !userId || !prompt) {
    failRequest(res);
  }
  else {
    await authenticateUser(axios, appId, appSecret, nonce, userId).then(async (result) => {
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
  const { appId, appSecret, nonce, userId, prompt } = req.query;

  if (!appId || !appSecret || !nonce || !userId || !prompt) {
    failRequest(res);
  }

  console.log("Query Params Recieved: " + JSON.stringify(req.query));
  console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));

  // Step 2: Authenticate the user via Oculus API
  await authenticateUser(axios, appId, appSecret, nonce, userId, TESTMODE).then(async (result) => {
    if (result) {
      // Step 3: Get user info/access permissions from Realize Database
      await db.getUserData(userId, TESTMODE).then(async (userInfo) => {
        if (userInfo.access === "full") {
          console.log("Received user info, full access. Calling Blockade API");
          const generationUuid = uuidv4();
          await db.storeUuid(generationUuid, userId, prompt);
          // Step 4: Get 360 Image from Blockade API
          await get360Image(axios, prompt, generationUuid).then(() => {
            res.status(200).send({ authenticated: true, access: "full", generationId: generationUuid});
          });
        }
        else {
          failRequest(res);
        }
      })
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