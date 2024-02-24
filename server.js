require('dotenv').config();
// instantiate an express server on HTTPS, use helmet to secure the server, and use the body-parser middleware to parse incoming requests.
const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const md5 = require('md5');
const axios = require('axios');

const TESTMODE = true;

const authenticatorPath = './authenticate.js';
const getUserInfoPath = './getUserInfo.js';
const get360ImagePath = './get360Image.js';

const authenticateUser = require(authenticatorPath);
const getUserInfo = require(getUserInfoPath);
const get360Image = require(get360ImagePath);

const endpointString = md5(process.env.ENDPOINT);
app.use(helmet(), bodyParser.json());

async function saveBlockadeImageDataToDatabase(data){

}
function createTemporaryWebhookEndpoint(app, endpointString, user_id){
  app.post(`/${endpointString}`, (req, res) => {
    console.log("Received webhook request from Blockade API");
    console.log(req.body);
  });
}

async function pollDatabaseForImage(webHookHash){
  // Poll the database for the image after waiting an initial 30 seconds
  // If the image is ready, return it
  // If the image is not ready, try again in 5 seconds. After 5 minutes, return an error

}

function failRequest(res, statusCode = 401, response = {authenticated: false}){
  res.status(statusCode).send(response);
}
app.get(`/${endpointString}`, async (req, res) => {
  // Step 1: Request made to the server
  const { appId, appSecret, nonce, userId, prompt } = req.body;
    console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));
    // Step 2: Authenticate the user via Oculus API
    await authenticateUser(axios, appId, appSecret, nonce, userId, TESTMODE).then(async (result) => {
      if(result){
        // Step 3: Get user info/access permissions from Realize Database
        await getUserInfo(axios, userId, TESTMODE).then(async (userInfo) => {
          if(userInfo.access === "full"){
            console.log("Received user info, full access. Calling Blockade API");
            const webHookHash = md5(Math.random().toString());
            // Step 4: Get 360 Image from Blockade API
            
            await get360Image(axios, prompt, webHookHash).then((response) => {
              if(response){
                // Create webhook post endpoint for blockade api to call when image generation is done
                createTemporaryWebhookEndpoint(app, webHookHash);
              }
              else{
                failRequest(res, 500, {authenticated: true, access: "full", response: response});
              }
            });
          }
          else{
            failRequest(res);
          }
        });
      }
      else{
        failRequest(res);
      }
    });;
    // Respond to the client as needed

});

// create an HTTP server
app.listen(80, () => {
  console.log('Server started on http://localhost:80');
  console.log('Endpoint: ' + endpointString);
});

