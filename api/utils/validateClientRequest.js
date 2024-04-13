function validateClientRequest(request){
    const userAgentString = request.headers['user-agent'];
    // if user agent string does not contain UnityPlayer, return false
    if(!userAgentString.includes('UnityPlayer')){
      console.log("Invalid User Agent: " + userAgentString);
      return false;
    }
    else{
      return true;
    }
}
  
module.exports = validateClientRequest;