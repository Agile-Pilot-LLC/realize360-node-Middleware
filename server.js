require('dotenv').config();
// instantiate an express server on HTTPS, use helmet to secure the server, and use the body-parser middleware to parse incoming requests.
const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const md5 = require('md5');
const axios = require('axios');

const TESTMODE = true;

const authenticatorPath = './authenticate.js';
const getUserInfoPath = './getUserInfo.js';
const get360ImagePath = './get360Image.js';

const authenticateUser = require(authenticatorPath);
const getUserInfo = require(getUserInfoPath);
const get360Image = require(get360ImagePath);

const httpsConfig = {
  key: fs.readFileSync('https/server.key'),
  cert: fs.readFileSync('https/server.cert')
};

const endpointString = md5("Authenticate");
app.use(helmet(), bodyParser.json());

app.get(`/${endpointString}`, async (req, res) => {
  const webHookHash = md5(Math.random().toString());
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
            // Step 4: Get 360 Image from Blockade API
            await get360Image(axios, prompt, process.env.BLOCKADE_API_KEY).then((response) => {
              if(response){
                // Create webhook post endpoint for blockade api to call when image generation is done
                app.post(`/${webHookHash}`, (req, res) => {
                  console.log("Received webhook request from Blockade API");
                  res.status(200).send({authenticated: true, access: "full", response: response});
                  // close the endpoint
                  app.delete(`/${webHookHash}`);
                });
                res.status(200).send({authenticated: true, access: "full", response: response});
              }
              else{
                res.status(500).send({authenticated: true, access: "full", response: response});
              }
            });
            

            
          }
          else{
            res.status(401).send({authenticated: true, access: "none"});
          }
        });
      }
      else{
        res.status(401).send({authenticated: false});
      }
    });;
    // Respond to the client as needed

});

// Path: server.js
// create a server object and listen on the port 443
const server = https.createServer(httpsConfig, app);

server.listen(443, () => {
  console.log('Server started on https://localhost:443');
  console.log('Endpoint: ' + endpointString);
});

