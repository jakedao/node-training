const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
  // using the ID to sign a token and will use the ID to validate in future usage
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const validateToken = async (token) => {
  // promisify - a simpler way to return a promise
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

const getTokenFromHeader = (headers) => {
  let token;
  const authorization = headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  return token;
};

module.exports = { signToken, validateToken, getTokenFromHeader };
