function validateBlockadeHeaders(headers){
  const {
    'content-type': contentType,
    'user-agent': userAgent,
  } = headers;

  if(contentType === 'application/json' && userAgent === 'GuzzleHttp/7'){
    return true;
  }
  else{
    return false;
  }
}

module.exports = validateBlockadeHeaders;