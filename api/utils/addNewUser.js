async function addNewUser(db, userId, testmode = false) {
  if(testmode){
    return true;
  }
  // check if the user is authorized
  let user = await db.getUserData(userId);
  if(!user){
    console.log(`User "${userId}" does not exist, adding to db`);
    await db.addUser(userId);
  }
  return true;
};

module.exports = addNewUser;