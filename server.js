require('dotenv').config();
// instantiate an express server on HTTPS, use helmet to secure the server, and use the body-parser middleware to parse incoming requests.
const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const md5 = require('md5');

const TESTMODE = true;

const authenticatorPath = './authenticate.js';
const getUserInfoPath = './getUserInfo.js';

const authenticateUser = require(authenticatorPath);
const getUserInfo = require(getUserInfoPath);

const httpsConfig = {
  key: fs.readFileSync('https/server.key'),
  cert: fs.readFileSync('https/server.cert')
};

const endpointString = md5("Authenticate");
app.use(helmet(), bodyParser.json());

app.get(`/${endpointString}`, async (req, res) => {
  const { appId, appSecret, nonce, userId } = req.body;
    console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));
    // Call the authenticateUser function
    await authenticateUser(appId, appSecret, nonce, userId, TESTMODE).then(async (result) => {
      if(result){
        await getUserInfo(userId, TESTMODE).then((userInfo) => {
          if(userInfo.access === "full"){
            console.log("Received user info, full access. Calling Blockade API");
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

