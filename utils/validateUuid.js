function validateUuid(uuid){
  if(uuid.length === 36){
    return true;
  }
  else{
    console.log("Received Invalid UUID: " + uuid);
    return false;
  }
}

module.exports = validateUuid;