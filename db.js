const { Firestore } = require('@google-cloud/firestore');

const serviceAccount = JSON.parse(process.env.FIRESTORE_AUTH);


const db = new Firestore({
  projectId: 'realize-360',
  databaseId: 'realize-db',
  credentials: serviceAccount
});


async function saveBlockadeData(uuid, data){
  db.collection('generations').doc(uuid).set(data);
}


async function pollDatabaseForImage(uuid){
  // Poll the database for the image after waiting an initial 30 seconds
  // If the image is ready, return it
  // If the image is not ready, try again in 5 seconds. After 5 minutes, return an error

}

async function storeUuid(uuid){
  // store an object with webhook hash as key and no values
  db.collection('generations').set(uuid, {});
}
async function checkIfUuidExists(uuid){
  // check if the webhook hash exists in the database
  db.collection('generations').get(uuid).then((doc) => {
    if(doc.exists){
      return true;
    }
    else{
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