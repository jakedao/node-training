const User = require('../models/userModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const { API_STATUS } = require('../constants/common');
const { signToken } = require('../utils/tokenHelper');

const filterRequestBody = (bodyObj, ...allowedFields) => {
  let res;
  res = Object.keys(bodyObj).reduce((acc, obj) => {
    if (allowedFields.includes(obj)) {
      return {
        ...acc,
        [obj]: bodyObj[obj],
      };
    }
  }, {});
  return res;
};



exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    status: 'succuess',
    result: users.length,
    data: { users },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'API is implementing',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'API is implementing',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'API is implementing',
  });
};

exports.updateLoggedInUser = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, role } = req.body;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        'Please use update password link to update your password',
        API_STATUS.NOT_FOUND
      )
    );
  }

  if (role) {
    return next(new AppError('Not allow to change user role', 401));
  }

  const filteredBody = filterRequestBody(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    message:
      'User has been deactived - Please contact the admin to re-active the user',
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const requestedParams = req.params;
  const deletedUser = await User.findByIdAndDelete(requestedParams.id);
  if (!deletedUser) {
    return next(
      new AppError(
        `No user found with id: ${requestedParams.id}`,
        API_STATUS.NOT_FOUND
      )
    );
  }

  res.status(204).json({
    status: 'success',
    // message: 'User has been deleted successful',
  });
});
