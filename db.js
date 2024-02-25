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

async function storeUuid(uuid, userId, prompt){
  // store an object with webhook hash as key and no values
  await generationCollection.doc(uuid).set({
    userId: userId,
    prompt: prompt
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
  getUserData
};