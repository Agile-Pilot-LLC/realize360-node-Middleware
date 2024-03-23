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
const path = require('path');

// Custom Dependencies
const db = require('./db.js');
const authenticateUser = require('./authenticate.js');
const get360Image = require('./get360Image.js');
const failRequest = require('./utils/failRequest.js');
const validateBlockadeHeaders = require('./utils/validateBlockadeHeaders.js');
const validateUuid = require('./utils/validateUuid.js');
const validateClientRequest = require('./utils/validateClientRequest.js');

// Variables
const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);
const checkDbString = md5(process.env.CHECK_DB);
const isDevEnvironment = process.env.NODE_ENV === 'development';

const TESTMODE = isDevEnvironment ? true : false;
// 0 = Down, reject users
  // 1 = Up, accept users
const SERVERSTATUSCODE = 1;

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacypolicy.html'));
});

app.get('/status', (req, res) => {  
  res.status(200).send(`${SERVERSTATUSCODE}`);
});

app.get(`/getUserGenerationCount`, async (req, res) => {
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }

  let userId = req.query.u;
  let count = await db.getUserGenerationCount(userId);
  res.status(200).send(`${count}`);

});
app.get(`/${checkDbString}`, async (req, res) => {
  const generationUuid = req.query.g;
  const checkDbKey = req.query.k;
  const userId = req.query.u;

  if(!generationUuid || !checkDbKey || !userId ){
    failRequest(res, 404);
  }

  if(!validateUuid(generationUuid) || checkDbKey != process.env.CHECK_DB_KEY){
    console.log("Invalid key or uuid used in checkDb request.")
    failRequest(res, 404);
  }
  else {
    let generationData = await db.getGeneration(generationUuid);
    if (generationData.file_url) {
      console.log("Image url found for generation ID: " + generationUuid);
      console.log("Sending user URL: " + generationData.file_url)
      await db.moveBlockadeData(generationUuid);
      res.status(200).send(generationData.file_url);
    }
    else {
      console.log("Image url not found for generation ID: " + generationUuid);
      failRequest(res, 400, { message: "Not found or still in progress." });
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
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  const { n: nonce, u: userId, p: prompt } = req.query;

  if (!nonce || !userId || SERVERSTATUSCODE == 0) {
    failRequest(res);
    return;
  }


  console.log("Query Params Recieved: " + JSON.stringify(req.query));
  console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));

  // Step 2: Authenticate the user via Oculus API
  await authenticateUser(axios, nonce, userId, TESTMODE, false).then(async (result) => {
    
    if (result) {
      let count = await db.getUserGenerationCount(userId);
      if(count < 1){
        console.log("User ID: " + userId + "made request with no generations left.")
        failRequest(res);
        return;
      }

      console.log("Received user info, full access. Calling Blockade API");
      const generationUuid = uuidv4();
      await db.storeUuid(generationUuid, userId, prompt, TESTMODE);
      db.decrementUserGenerationCount(userId, TESTMODE);

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
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

module.exports = app;