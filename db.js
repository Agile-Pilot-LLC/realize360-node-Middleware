const { Firestore } = require('@google-cloud/firestore');

const serviceAccount = JSON.parse(process.env.FIRESTORE_AUTH);
const db = new Firestore({
  projectId: 'realize-360',
  databaseId: 'realize-db',
  credentials: serviceAccount
});

const generationDatabaseName = "generations";
const userDatabaseName = "users";
const generationCollection = db.collection(generationDatabaseName);
const userCollection = db.collection(userDatabaseName);

async function saveBlockadeData(uuid, data){
  await generationCollection.doc(uuid).set(data, { merge: true });
  console.log(`Saved Blockade Data for UUID "${uuid}" in "${generationDatabaseName}" collection.`);
}

async function addUser(userId){
  // add new entry to users collection
  await userCollection.doc(userId).set({
    meta_id: userId,
    generationsRemaining: 25
  });
  console.log(`Added user "${userId}" to "${userDatabaseName}" collection.`);
}
async function decrementUserGenerationCount(userId){
  // decrement generations remaining for user
  let user = await getUserData(userId);
  let generationsRemaining = user.generationsRemaining;
  if(generationsRemaining > 0){
    generationsRemaining--;
    await userCollection.doc(userId).set({
      generationsRemaining: generationsRemaining
    }, { merge: true });
    console.log(`Decremented generations remaining for user "${userId}" in "${userDatabaseName}" collection.`);
  }
  else{
    console.log(`User "${userId}" has no generations remaining.`);
  }
}
async function getUserGenerationCount(userId){
  let user = await getUserData(userId);
  // if there is no user data return -1
  if(!user){
    return -1;
  }
  
  return user.generationsRemaining;
}

async function getGeneration(uuid){
  let generation = false;
  await generationCollection.doc(uuid).get().then((doc) => {
    if(doc.exists){
      generation = doc.data();
    }
    else{
      console.log(`No generation found for UUID "${uuid}" in "${generationDatabaseName}" collection.`);
    }
  });
  return generation;
}

async function storeUuid(uuid, userId, prompt, TESTMODE){
  // store an object with webhook hash as key and no values
  if(TESTMODE){
    return;
  }

  await generationCollection.doc(uuid).set({
    metaUserId: userId,
  }).then(() => {
    console.log(`Stored UUID "${uuid}" in "${generationDatabaseName}" collection.`);
  });
}
async function checkIfUuidExists(uuid){
  // check if the webhook hash exists in the database
  console.log(`Checking if UUID "${uuid}" exists in "${generationDatabaseName}" collection.`)
  let result = false;
  await generationCollection.doc(uuid).get().then((doc) => {
    if(doc.exists){
      console.log(`UUID "${uuid}" exists in "${generationDatabaseName}" collection.`);
      result = true;
    }
    else{
      console.log(`UUID "${uuid}" does not exist in "${generationDatabaseName}" collection.`);
    }
  });
  return result;
}

async function getUserData(userId, testmode = false){
  if(testmode){
    return {
        id: userId,
        access: "full",
    }
  };
  let user = false;
  await userCollection.doc(userId).get().then((doc) => {
    if(doc.exists){
      user = doc.data();
    }
    else{
      // add user to database
      console.log(`User "${userId}" does not exist in "${userDatabaseName}" collection.`);
    }
  });
  return user;
}

module.exports = {
  saveBlockadeData,
  getGeneration,
  storeUuid,
  checkIfUuidExists,
  getUserData,
  addUser,
  decrementUserGenerationCount,
  getUserGenerationCount
};