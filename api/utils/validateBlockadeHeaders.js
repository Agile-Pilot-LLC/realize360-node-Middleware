function validateBlockadeHeaders(headers){
  const {
    'content-type': contentType,
    'user-agent': userAgent,
  } = headers;

  if(contentType === 'application/json' && userAgent === 'GuzzleHttp/7'){
    return true;
  }
  else{
    console.log("Received Invalid Headers: " + JSON.stringify(headers));
    return false;
  }
}

module.exports = validateBlockadeHeaders;