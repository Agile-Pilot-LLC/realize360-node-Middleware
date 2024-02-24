// import dotenv
require('dotenv').config();

module.exports = async function get360Image(axios = null, prompt, key, webHookHash) {
    const headers = {
        'x-api-key': key,
        'Content-Type': 'application/json'
    };

    // Define the data to be sent in the body
    const data = {
        prompt: prompt,
        webhook_url: `https://${process.env.NODE_IP}/${webHookHash}`
    };

    // Define the endpoint
    const endpoint = 'https://backend.blockadelabs.com/api/v1/skybox';

    // Perform the POST request using Axios
    axios.post(endpoint, data, { headers })
        .then(response => {
            console.log('Response:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}