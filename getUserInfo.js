module.exports = async function getUserInfo(userId, testmode = false){
    if(testmode){
        return {
            id: "1234567890",
            access: "full"
        }
    };
};