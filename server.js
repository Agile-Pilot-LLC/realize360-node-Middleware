// instantiate an express server on HTTPS, use helmet to secure the server, and use the body-parser middleware to parse incoming requests.
const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');

const fakeAuthenticatorPath = './fakeAuthenticate.js';
const authenticatorPath = './authenticate.js';

// const AuthenticateUser = require(fakeAuthenticatorPath);
const AuthenticateUser = require(fakeAuthenticatorPath);

const httpsConfig = {
  key: fs.readFileSync('https/server.key'),
  cert: fs.readFileSync('https/server.cert')
};

app.use(helmet(), bodyParser.json());

app.get('/authenticate', async (req, res) => {
  const { appId, appSecret, nonce, userId } = req.body;
    console.log("Recieved authentication request from IP: " + req.ip + " at time: " + Date.now('YYYY-MM-DDTHH:mm:ss.SSSZ'));
    // Call the AuthenticateUser function
    await AuthenticateUser(appId, appSecret, nonce, userId).then((result) => {
      if(result){
        res.status(200).send({authenticated: true});
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
});

