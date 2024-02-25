function failRequest(res, statusCode = 401, response = { authenticated: false }) {
  res.status(statusCode).send(response);
}

module.exports = failRequest;