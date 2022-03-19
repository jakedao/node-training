const User = require('../models/userModel');

const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { signToken, validateToken } = require('../utils/tokenHelper');

const { API_STATUS } = require('../constants/common');

exports.signUp = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);
  res.status(API_STATUS.CREATED).json({
    status: 'success',
    access_token: token,
    message: {
      user: newUser,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // validate password & email
  if (!email && !password) {
    return next(
      new AppError('Please provide email & password', API_STATUS.BAD_REQUEST)
    );
  }

  // find user with the entered email and return with user's password
  const user = await User.findOne({ email }).select('+password');

  const isValid =
    (user && (await user.correctPassword(password, user.password))) || false;

  // check password & email correct
  if (!user || !isValid) {
    return next(new AppError(AUTH_MSG.INCORRECT_MSG, API_STATUS.UNAUTHORIZED));
  }

  // generate access token for client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: AUTH_MSG.SUCCESS_LOGIN_MSG,
    access_token: token,
  });
});

exports.verifyToken = catchAsync(async (req, res, next) => {
  // Getting token
  let token;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'Please login to have to the access',
        API_STATUS.UNAUTHORIZED
      )
    );
  }
  // Validate token
  const decodedToken = await validateToken(token);

  // Check user availability
  const foundUser = await User.findById(decodedToken.id);
  if (!foundUser) {
    return next(
      new AppError('User has no longer existed', API_STATUS.UNAUTHORIZED)
    );
  }

  // Check password was modified after token issued
  if (foundUser.changedPasswordAt(decodedToken.iat)) {
    return next(
      new AppError(AUTH_MSG.PASSWORD_CHANGED_MSG, API_STATUS.UNAUTHORIZED)
    );
  }

  /*
    - Grant access to other route
    - Assign a new attribute user to foundUser var to access to user info for later use
    in next middle ware
  */
  req.user = foundUser;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(AUTH_MSG.NOT_ALLOWED, API_STATUS.NOT_ALLOWED));
    }
    next();
  };
};
