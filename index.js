const app = require('./app.js');
const helmet = require('helmet');
const md5 = require('md5');
const bodyParser = require('body-parser');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

const endpointString = md5(process.env.ENDPOINT);
const sendGenerationString = md5(process.env.SEND_GENERATION);

app.use(helmet(), bodyParser.json());

app.listen(PORT, () =>
  {
    console.log(`realizeAPI listening on ${PORT}`)
    console.log(`GET Endpoint: ${endpointString}`)
    console.log(`POST Endpoint: ${sendGenerationString}`)
    console.log('FIRESTORE AUTH: ' + process.env.FIRESTORE_AUTH)
  }
);