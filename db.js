const { Firestore } = require('@google-cloud/firestore');

const serviceAccount = JSON.parse(process.env.FIRESTORE_AUTH);
const generationDatabaseName = "generations";
const userDatabaseName = "users";
const db = new Firestore({
  projectId: 'realize-360',
  databaseId: 'realize-db',
  credentials: serviceAccount
});

const generationCollection = db.collection(generationDatabaseName);
const userCollection = db.collection(userDatabaseName);

async function saveBlockadeData(uuid, data){
  generationCollection.doc(uuid).set(data);
}


async function pollDatabaseForImage(uuid){
  // Poll the database for the image after waiting an initial 30 seconds
  // If the image is ready, return it
  // If the image is not ready, try again in 5 seconds. After 5 minutes, return an error

}

async function storeUuid(uuid){
  // store an object with webhook hash as key and no values
  generationCollection.doc(uuid).set({}).then(() => {
    console.log(`Stored UUID "${uuid}" in "${generationDatabaseName}" collection.`);
  });
}
async function checkIfUuidExists(uuid){
  // check if the webhook hash exists in the database
  console.log(`Checking if UUID "${uuid}" exists in "${generationDatabaseName}" collection.`)
  generationCollection.doc(uuid).get().then((doc) => {
    if(doc.exists){
      console.log(`UUID "${uuid}" exists in "${generationDatabaseName}" collection.`);
      return true;
    }
    else{
      console.log(`UUID "${uuid}" does not exist in "${generationDatabaseName}" collection.`);
      return false;
    }
  });
}

module.exports = {
  saveBlockadeData,
  pollDatabaseForImage,
  storeUuid,
  checkIfUuidExists
};