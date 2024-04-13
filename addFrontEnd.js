const path = require('path');
// 0 = Down, reject users
  // 1 = Up, accept users
const SERVERSTATUSCODE = 1;

const frontEndHtmlPathRoot = '/frontend/html';

function addFrontEnd(app){
    app.get('/status', (res) => {  
        res.status(200).send(`${SERVERSTATUSCODE}`);
    });
    app.get('/privacy-policy', (res) => {
        res.sendFile(path.join(__dirname, `${frontEndHtmlPathRoot}/privacypolicy.html`));
    });
    app.get('/', (res) => {
        res.sendFile(path.join(__dirname, `${frontEndHtmlPathRoot}/homepage.html`));
    });
}

module.exports = addFrontEnd;