// import dotenv
require('dotenv').config();
const md5 = require('md5');

module.exports = async function get360Image(axios = null, prompt, generationUuid) {
    const headers = {
        'x-api-key': process.env.BLOCKADE_API_KEY,
        'Content-Type': 'application/json'
    };
    const genReceiveEndpoint = md5(process.env.SEND_GENERATION);

    // Define the data to be sent in the body
    const data = {
        prompt: prompt,
        webhook_url: `https://realize.agilepilot.co/${genReceiveEndpoint}?g=${generationUuid}`
    };

    // Define the endpoint
    const endpoint = 'https://backend.blockadelabs.com/api/v1/skybox';
    let responseResult;
    // Perform the POST request using Axios
    axios.post(endpoint, data, { headers })
        .then(response => {
            responseResult = true;
            console.log(`Blockade API Request Success for Generation ${generationUuid}`);
        })
        .catch(error => {
            console.error('Error:', error);
            result = false;
        });
    return responseResult;
}