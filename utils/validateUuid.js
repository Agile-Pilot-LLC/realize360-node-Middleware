function validateUuid(uuid){
  if(uuid.length === 36){
    return true;
  }
  else{
    return false;
  }
}

module.exports = validateUuid;