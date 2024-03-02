// Define the function to authenticate the user
module.exports = async function authenticateUser(axios = null, nonce, userId, testmode = false) {
    // Define the access token (replace $APP_ID and $APP_SECRET with your actual values)
    if(testmode){
        return true;
    }
    const appId = process.env.APP_ID;
    const appSecret = process.env.APP_SECRET;

    const accessToken = `OC|${appId}|${appSecret}`;
    // Define the data to be sent in the POST request;

    const response = await axios.post('https://graph.oculus.com/user_nonce_validate', {
        access_token: accessToken,
        nonce: nonce,
        user_id: userId
    });
    
    console.log(response.body);
}
