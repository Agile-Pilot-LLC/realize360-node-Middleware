const { Firestore } = require('@google-cloud/firestore');

const serviceAccount = JSON.parse(process.env.FIRESTORE_AUTH);
const db = new Firestore({
  projectId: 'realize-360',
  databaseId: 'realize-db',
  credentials: serviceAccount
});

const generationDatabaseName = "generations";
const activeGenerationDatabaseName = "active-generations";
const userDatabaseName = "users";
const activeGenerationCollection = db.collection(activeGenerationDatabaseName);
const generationCollection = db.collection(generationDatabaseName);
const userCollection = db.collection(userDatabaseName);

async function moveBlockadeData(uuid){
  // move data from activeGenerations to generations
  let generationData = await getGeneration(uuid);
  if(generationData){
    await generationCollection.doc(uuid).set(generationData);
    console.log(`Moved Blockade Data for UUID "${uuid}" to "${generationDatabaseName}" collection.`);
    await activeGenerationCollection.doc(uuid).delete();
    console.log(`Deleted Blockade Data for UUID "${uuid}" from "${activeGenerationDatabaseName}" collection.`);
  }
  else{
    console.log(`No generation found for UUID "${uuid}" in "${generationDatabaseName}" collection.`);
  }
}
async function saveBlockadeData(uuid, data){
  await activeGenerationCollection.doc(uuid).set(data, { merge: true });
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
async function decrementUserGenerationCount(userId, TESTMODE){
  // decrement generations remaining for user
  if(TESTMODE){
    return;
  }
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
  console.log(`User "${userId}" has "${user.generationsRemaining}" generations remaining.`)
  return user.generationsRemaining;
}

async function getGeneration(uuid){
  let generation = false;
  await activeGenerationCollection.doc(uuid).get().then((doc) => {
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

  await activeGenerationCollection.doc(uuid).set({
    metaUserId: userId,
  }).then(() => {
    console.log(`Stored UUID "${uuid}" in "${generationDatabaseName}" collection.`);
  });
}
async function checkIfUuidExists(uuid){
  // check if the webhook hash exists in the database
  console.log(`Checking if UUID "${uuid}" exists in "${generationDatabaseName}" collection.`)
  let result = false;
  await activeGenerationCollection.doc(uuid).get().then((doc) => {
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
  moveBlockadeData,
  getGeneration,
  storeUuid,
  checkIfUuidExists,
  getUserData,
  addUser,
  decrementUserGenerationCount,
  getUserGenerationCount
};