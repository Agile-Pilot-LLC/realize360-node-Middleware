// NPM Dependencies
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const md5 = require('md5');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Timestamp } = require('@google-cloud/firestore/build/src/timestamp');
// App Instantiate
const app = express();

// Middleware 
// TODO: Add query parameter sanitization
app.use(helmet(), bodyParser.json());

// Custom Dependencies
const db = require('./db.js');
const authenticateUser = require('./api/utils/authenticate.js');
const get360Image = require('./api/utils/get360Image.js');
const failRequest = require('./api/utils/failRequest.js');
const validateBlockadeHeaders = require('./api/utils/validateBlockadeHeaders.js');
const validateUuid = require('./api/utils/validateUuid.js');
const validateClientRequest = require('./api/utils/validateClientRequest.js');
const consumePurchase = require('./api/utils/consumePurchase.js');
const requestMusicType = require('./api/utils/requestMusicType.js');

// Variables
const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);
const checkDbString = md5(process.env.CHECK_DB);
const saveGenerationString = md5(process.env.SAVE_GENERATION_ENDPOINT);
const deleteGenerationEndpoint = md5(process.env.DELETE_GENERATION_ENDPOINT);
const addGenerationEndpoint = md5(process.env.ADD_GENERATION_ENDPOINT);
const requestMusicEndpoint = md5(process.env.REQUEST_MUSIC_ENDPOINT);

const isDevEnvironment = process.env.NODE_ENV === 'development';

const TESTMODE = isDevEnvironment ? true : false;

app.get('/savesRemaining', async (req, res) => {  
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  let userId = req.query.u;

  if(!userId){
    failRequest(res, 404);
    return;
  }

  let savesRemaining = await db.getSavesRemaining(userId);
  res.status(200).send(`${savesRemaining}`);
});
;
app.get('/savedGenerations', async (req, res) => {
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  // TODO: encrypt the endpoint
  let userId = req.query.u;

  if(!userId){
    failRequest(res, 404);
    return;
  }

  let generationUuidArray = await db.getSavedGenerations(userId);
  // convert to a string with each generation uuid separated by "|"
  let generationString = generationUuidArray.join("|");
  res.status(200).send(generationString);
});

app.get(`/${saveGenerationString}`, async (req, res) => {
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  // TODO: make it a POST
  let userId = req.query.u;
  let generationId = req.query.g;
  let nonce = req.query.n;

  if(!userId || !generationId || !nonce ){
    failRequest(res, 404);
    return;
  }

  await authenticateUser(axios, nonce, userId, TESTMODE, false).then(async (result) => {
    if(result){
      await db.saveGeneration(generationId);
      res.status(200).send("Saved Generation");
    }
    else{
      res.status(400).send("Failed to save generation");
    }
  });
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
    if(TESTMODE){
      res.status(200).send({
        imageUrl : "https://storage.googleapis.com/realize-public/019a0a6b-a042-4404-b7e6-cf37e4855699FFFF.jpg",
        depthmapUrl : "https://storage.googleapis.com/realize-public/019a0a6b-a042-4404-b7e6-cf37e4855699DDDD.jpg"
      });
      return;
    }
    
    let generationData = await db.getActiveGeneration(generationUuid);

    if (generationData.file_url) {
      console.log("Image url found for generation ID: " + generationUuid);
      console.log("Sending user URL: " + generationData.file_url)

      var generationDataResponse = {
        imageUrl: generationData.file_url,
        depthmapUrl: generationData.depth_map_url
      }

      await db.moveBlockadeData(generationUuid);

      res.status(200).send(generationDataResponse);
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

  if (!nonce || !userId) {
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
          res.status(200).send("c52c73e3-4b9d-475b-863c-d2a10f8cb6b1");
        }
        else{
          res.status(200).send(generationUuid);
        }
      });
    }
    else {
      failRequest(res);
    }
  })
});

app.delete(`/${deleteGenerationEndpoint}`, async (req, res) => {
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  let inputtedKey = req.query.k; 

  if(inputtedKey != process.env.DELETE_GENERATION_KEY){
    failRequest(res);
    return;
  }

  let userId = req.query.u;
  let generationId = req.query.g;
  let nonce = req.query.n;

  await authenticateUser(axios, nonce, userId, false, false).then(async (result) => {
    if(result){
      await db.deleteSavedGeneration(userId, generationId);
      res.status(200).send("Deleted Generation");
    }
    else{
      res.status(400).send("Failed to delete generation");
    }
  });
});

app.get(`/${addGenerationEndpoint}`, async (req, res) => {
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  let inputtedKey = req.query.k; 

  if(inputtedKey != process.env.ADD_GENERATION_KEY){
    failRequest(res);
    return;
  }

  let userId = req.query.u;
  let nonce = req.query.n;

  await authenticateUser(axios, nonce, userId, false, false).then(async (result) => {
    if(result){
      await consumePurchase("001", userId).then(async (result) => {
        if(result){
          await db.logPurchase(userId, "25 generations");
            console.log("Logged purchase of 25 generations for user ID: " + userId);

            await db.add25Generations(userId);
            
            res.status(200).send("Added 25 Generations to user");
        }
        else{
          res.status(400).send("Failed to consume purchase");
        }
      });
    }
    else{
      res.status(400).send("Failed to add generation");
    }
  });
});

app.get(`/${requestMusicEndpoint}`, async (req, res) => {
  if(!validateClientRequest(req)){
    failRequest(res);
    return;
  }
  let inputtedKey = req.query.k; 

  if(inputtedKey != process.env.REQUEST_MUSIC_KEY){
    failRequest(res);
    return;
  }

  const { n: nonce, u: userId, p: prompt } = req.query;

  if (!nonce || !userId) {
    failRequest(res);
    return;
  }

  await authenticateUser(axios, nonce, userId, false, false).then(async (result) => {
    if(result){
      let musicType = await requestMusicType(prompt);
      res.status(200).send(musicType);
    }
    else{
      res.status(400).send("Failed to request music type");
    }
  });
});

module.exports = app;