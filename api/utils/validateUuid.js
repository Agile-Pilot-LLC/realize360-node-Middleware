function validateUuid(uuid){
  if(uuid === undefined){
    console.log("Received Undefined UUID");
    return false;
  }
  if(uuid.length === 36){
    return true;
  }
  else{
    console.log("Received Invalid UUID: " + uuid);
    return false;
  }
}

module.exports = validateUuid;