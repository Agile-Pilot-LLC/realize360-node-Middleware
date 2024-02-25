function failRequest(res, statusCode = 404) {
  res.status(statusCode).send();
}

module.exports = failRequest;