const User = require('../models/userModal');

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

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'API is implementing',
  });
};
