// Define the function to authenticate the user
const addNewUser = require('./utils/addNewUser.js');
const db = require('./db.js');

module.exports = async function authenticateUser(axios = null, nonce, userId, testmode = false, bypassMetaAuth) {
    // Define the access token (replace $APP_ID and $APP_SECRET with your actual values)
    if(testmode){
        return true;
    }
    if(bypassMetaAuth){
        await addNewUser(db, userId, testmode);
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

    let result = response.data;
    
    if(result.is_valid){
        await addNewUser(db, userId, testmode);
        return true;
    }
    else{
        return false;
    }
}
