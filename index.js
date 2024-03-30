const app = require('./app.js');
const md5 = require('md5');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);
const checkDbString = md5(process.env.CHECK_DB);

app.listen(PORT, () =>
  {
    // List endpoints
    console.log(`realize360-node-Middleware ${process.env.NODE_ENV} listening on ${PORT}`);
    console.log(`GET Endpoint: ${endpointString}`);
    console.log(`POST Endpoint: ${sendGenerationString}`);
    console.log(`Check DB Endpoint: ${checkDbString}`);
    console.log(`Check DB Key: ${process.env.CHECK_DB_KEY}`);
  }
);