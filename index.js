const app = require('./app.js');
const helmet = require('helmet');
const md5 = require('md5');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

const endpointString = md5(process.env.ENDPOINT);

app.use(helmet());

app.listen(PORT, () =>
  {
    console.log(`realizeAPI listening on ${PORT}`)
    console.log(`Endpoint: ${endpointString}`)
  }
);