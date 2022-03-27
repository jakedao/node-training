const User = require('../models/userModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

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

exports.getUser = (req, res) => {
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

exports.deleteUser = catchAsync(async (req, res, next) => {
  const requestedParams = req.params;
  console.log('params', requestedParams);
  const deletedUser = await User.findByIdAndDelete(requestedParams.id);

  if (!deletedUser) {
    return next(
      new AppError(`No user found with id: ${requestedParams.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    // message: 'User has been deleted successful',
  });
});
