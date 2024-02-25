module.exports = async function isAuthorized(db, userId, testmode = false) {
  if(testmode){
    return true;
  }
  // check if the user is authorized
  let user = await db.getUserData(userId);
  if(user){
    if(user.access === "full"){
      return true;
    }
    else{
      console.log(`User "${userId}" does not have full access.`);
      return false;
    }
  }
  else{
    console.log(`User "${userId}" does not exist.`);
    return false;
  }
};