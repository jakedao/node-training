const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Should be provided an string with email format (E.g: abc@email.com)',
    ],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // validating with CREATING & SAVING only
      validator: function (value) {
        return this.password === value;
      },
      message: 'Confirm password does not match with entered password',
    },
  },
  passwordChangedAt: Date,
});

// MIDDLEWARE

userSchema.pre('save', async function (next) {
  // if password field is not modified then return next function
  if (!this.isModified('password')) return next();

  // hashing the password with cost 12 - the higher cost the longer time taken to generated
  this.password = await bcrypt.hash(this.password, 12);

  // scoped-out password confirm in database
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changedPasswordAt = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    /* 
      1. getTime return timestamp in miliseconds from DATE OBJECT
      2. convert miliseconds to seconds by divided 1000
     */
    const modifiedDateTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimeStamp < modifiedDateTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
