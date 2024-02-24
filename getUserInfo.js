module.exports = async function getUserInfo(axios = null, userId, testmode = false){
    if(testmode){
        return {
            id: 243234,
            access: "full",
        }
    };
};