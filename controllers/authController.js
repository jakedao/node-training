const crypto = require('crypto');
const User = require('../models/userModel');

const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
  signToken,
  validateToken,
  getTokenFromHeader,
} = require('../utils/tokenHelper');

const { API_STATUS } = require('../constants/common');
const { AUTH_MSG } = require('../constants/message');
const { sendEmail } = require('../utils/email');

const createSendToken = (user, statusCode, res) => {
  // create token
  const token = signToken(user._id);

  // prepare cookies opts
  const cookieOpts = {
    expires: new Date(
      // Current Date + 4 * days * hours * seconds * miliseconds
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false, // TRUE - only set cookies when call with https request
    httpOnly: true, // can not be accessed or modified by browser => Prevent site scripting attack
  };

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;

  // set jwt to cookie storage
  res.cookie('jwt', token, cookieOpts);

  // scope-out password in user response
  user.password = undefined;

  // send token
  res.status(statusCode).json({
    message: 'success',
    access_token: token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  createSendToken(newUser, 201, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // validate password & email
  if (!email && !password) {
    return next(new AppError(AUTH_MSG.REQ_MSG, API_STATUS.BAD_REQUEST));
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
  const token = getTokenFromHeader(req.headers);

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError(AUTH_MSG.REQ_EMAIL_MSG, API_STATUS.NOT_ALLOWED));
  }

  // Get user based on the requested email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(AUTH_MSG.NO_USER_EMAIL_AVAILABLE_MSG, API_STATUS.NOT_FOUND)
    );
  }
  // generate the random reset token
  const resetToken = user.createPasswordResetToken();

  /*
    - save user info after generate the token 
    - validateBeforeSave: false => this flag will NOT validate the field in user model when saving 
  */
  await user.save({ validateBeforeSave: false });

  // send token into user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = resetURL;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset link is valid for 10 mins',
      message,
    });

    res.status(API_STATUS.SUCCESS).json({
      status: 'success',
      message: 'Please check your email address for reset link password link',
    });
  } catch (e) {
    console.log('checking errr', e);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There is an error while sending the reset email - Please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  // 1. get user based token (sent to user's email) and encrypt the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // find the user with token + check token has been not expire
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: new Date() },
  });

  // 2. token valid and user is available => update user password properties
  if (!user) {
    return next(new AppError(AUTH_MSG.TOKEN_INVALID_MSG, 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(API_STATUS.SUCCESS).json({
    message: 'success',
    access_token: signToken(user._id),
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword) {
    return next(
      new AppError(AUTH_MSG.REQ_CURRENT_PASSWORD_MSG, API_STATUS.NOT_ALLOWED)
    );
  }

  // 1. Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  // 2. Check if post current password is correct
  const isValid =
    (user && (await user.correctPassword(currentPassword, user.password))) ||
    false;

  if (!isValid) {
    return next(
      new AppError(
        'Your current password is not correct',
        API_STATUS.NOT_ALLOWED
      )
    );
  }
  // 3. Update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4. Sent JTW token
  res.status(API_STATUS.SUCCESS).json({
    status: 'success',
    message: 'Password has been changed successfully',
    // access_token: signToken(user._id),
  });
});
