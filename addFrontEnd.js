function addFrontEnd(app){
    app.get('/status', (req, res) => {  
        res.status(200).send(`${SERVERSTATUSCODE}`);
    });
    app.get('/privacy-policy', (req, res) => {
        res.sendFile(path.join(__dirname, 'privacypolicy.html'));
    });
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'homepage.html'));
    });
}

module.exports = addFrontEnd;