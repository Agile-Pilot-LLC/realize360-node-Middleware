require('dotenv').config();
const express = require('express');
const app = express();
const md5 = require('md5');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('./db.js');
const authenticateUser = require('./authenticate.js');
const getUserInfo = require('./getUserInfo.js');
const get360Image = require('./get360Image.js');

const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);

const TESTMODE = true;

function failRequest(res, statusCode = 401, response = {authenticated: false}){
  res.status(statusCode).send(response);
}

app.post(`/${sendGenerationString}`, async (req, res) => {
  let generationUuid = req.query.g;

  if(!generationUuid){
    failRequest(res, 400, {error: "Failed."});
  }
  else{
    db.checkIfUuidExists(generationUuid).then(async (result) => {
      if(result){
        let body = req.body;
        let status = body.status;
        
        if(status == "completed"){
         await awaitdb.saveBlockadeData(uuid, body);
        }
        
        console.log(`Webhook Hit by Blockade API, status "${status} for generation ID: ${generationUuid}`);
        res.status(200).send("Received :) - Thanks!");
      }
      else{
        failRequest(res, 400, {error: "Failed."});
      }
    });
  }
});

app.get(`/${endpointString}`, async (req, res) => {
  // Step 1: Request made to the server
  const { appId, appSecret, nonce, userId, prompt } = req.query;

  if(!appId || !appSecret || !nonce || !userId || !prompt){
    failRequest(res);
  }

  console.log("Query Params Recieved: " + JSON.stringify(req.query));
  console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));

  // Step 2: Authenticate the user via Oculus API
  await authenticateUser(axios, appId, appSecret, nonce, userId, TESTMODE).then(async (result) => {
    if(result){
      // Step 3: Get user info/access permissions from Realize Database
      await getUserInfo(axios, userId, TESTMODE).then(async (userInfo) => {
        if(userInfo.access === "full"){
          console.log("Received user info, full access. Calling Blockade API");
          const generationUuid = uuidv4();

          // Step 4: Get 360 Image from Blockade API
          await get360Image(axios, prompt, generationUuid).then(async (response) => {
            if(response){
              //Step 5: Create webhook post endpoint for blockade api to call when image generation is done
              console.log('Received response from Blockade API, polling DB for image');
              await db.storeUuid(generationUuid);
              res.status(200).send({authenticated: true, access: "full", response: response});

              // Step 6: Poll the database for the image after waiting an initial 30 seconds
            }
            else{
              failRequest(res, 500, {authenticated: true, access: "full", response: response});
            }})}
        else{
          failRequest(res);
        }})}
    else{
      failRequest(res);
}})});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;