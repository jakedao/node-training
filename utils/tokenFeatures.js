const jwt = require('jsonwebtoken');
const { promisify } = require('util');

import User from '../models/userModel';

// Under working

class TokenFeatures {
  constructor(userId) {
    this.userId = userId;
    this.token;
  }

  async validateToken() {
    // promisify - a simpler way to return a promise
    return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  }

  // async isValidToken() {
  //   const user = User.findById(this.userId);
  //   if(!user) return new
  // }
}

module.exports = TokenFeatures;
