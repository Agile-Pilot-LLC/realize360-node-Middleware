const app = require('./app.js');
const md5 = require('md5');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;

const endpointString = md5(process.env.ENDPOINT);
const checkDbString = md5(process.env.CHECK_DB);
const saveGenerationString = md5(process.env.SAVE_GENERATION_ENDPOINT);
const deleteGenerationString = md5(process.env.DELETE_GENERATION_ENDPOINT);
const deleteGenerationKey = process.env.DELETE_GENERATION_KEY;

app.listen(PORT, () =>
  {
    // List endpoints
    console.log(`realize360-node-Middleware (Environment: ${process.env.NODE_ENV}) listening on ${PORT}`);
    console.log(`Start Generation Endpoint: ${endpointString}`);
    console.log(`Poll Generation Endpoint: ${checkDbString}`);
    console.log(`Poll Key: ${process.env.CHECK_DB_KEY}`);
    console.log(`Save Generation Endpoint: ${saveGenerationString}`);
    console.log(`Delete Generation Endpoint: ${deleteGenerationString}`);
    console.log(`Delete Generation Key: ${deleteGenerationKey}`);
    console.log(`Add Generation Endpoint: ${md5(process.env.ADD_GENERATION_ENDPOINT)}`);
    console.log(`Add Generation Key: ${process.env.ADD_GENERATION_KEY}`)
    console.log(`Request Music Endpoint: ${md5(process.env.REQUEST_MUSIC_ENDPOINT)}`);
    console.log(`Request Music Key: ${process.env.REQUEST_MUSIC_KEY}`);
  }
);