const app = require('./app.js');
const md5 = require('md5');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);

app.listen(PORT, () =>
  {
    console.log(`realizeAPI listening on ${PORT}`)
    console.log(`GET Endpoint: ${endpointString}`)
    console.log(`POST Endpoint: ${sendGenerationString}`)
  }
);