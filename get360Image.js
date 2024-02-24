// import dotenv
require('dotenv').config();

module.exports = async function get360Image(axios = null, genReceiveEndpoint, prompt, webHookHash) {
    const headers = {
        'x-api-key': process.env.BLOCKADE_API_KEY,
        'Content-Type': 'application/json'
    };

    // Define the data to be sent in the body
    const testHook = "https://webhook.site/663183ac-b5e6-4174-bdd4-6a292e14adcc";
    const data = {
        prompt: prompt,
        webhook_url: `https://realizeapi.agilepilot.co/${genReceiveEndpoint}?g=${webHookHash}`
    };
    const testData = {
        prompt: "mountain range in alaska with northern lights",
        webhook_url: testHook
    };

    // Define the endpoint
    const endpoint = 'https://backend.blockadelabs.com/api/v1/skybox';

    // Perform the POST request using Axios
    axios.post(endpoint, testData, { headers })
        .then(response => {
            console.log('Response:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}