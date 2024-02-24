const app = require('./app.js');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const PORT = parseInt(parseInt(process.env.PORT)) || 8080;


app.use(helmet(), bodyParser.json());

app.listen(PORT, () =>
  console.log(`realizeAPI listening on ${PORT}`)
);