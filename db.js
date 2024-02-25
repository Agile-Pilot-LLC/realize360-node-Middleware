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
  await generationCollection.doc(uuid).set(data);
}


async function pollDatabaseForImage(uuid){
  // Poll the database for the image after waiting an initial 30 seconds
  // If the image is ready, return it
  // If the image is not ready, try again in 5 seconds. After 5 minutes, return an error

}

async function storeUuid(uuid){
  // store an object with webhook hash as key and no values
  await generationCollection.doc(uuid).set({}).then(() => {
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

module.exports = {
  saveBlockadeData,
  pollDatabaseForImage,
  storeUuid,
  checkIfUuidExists
};