// Define the function to authenticate the user
module.exports = async function AuthenticateUser(axios = null, appId, appSecret, nonce, userId, testmode = false) {
    // Define the access token (replace $APP_ID and $APP_SECRET with your actual values)
    if(testmode){
        return true;
    }
    const accessToken = `OC|${appId}|${appSecret}`;

    // Define the data to be sent in the POST request
    const postData = {
        access_token: accessToken,
        nonce: nonce,
        user_id: userId
    };

    // Define the URL for the API endpoint
    const url = 'https://graph.oculus.com/user_nonce_validate';
    console.log("Sending request to Oculus API");
    // Make a POST request to the API endpoint
    try{
        let response = await axios.post(url, postData);
        console.log("Oculus API Success: " + response.message);
        return true;
    }
    catch(err){
        console.log("Oculups API Error: " + err.message);
        return false;
    }
}
