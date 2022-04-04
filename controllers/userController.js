const User = require('../models/userModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const { API_STATUS } = require('../constants/common');
const {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getAll,
} = require('../controllers/factoryHandler');

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

const getAllUsers = getAll(User);
const createUser = createOne(User);
const updateUser = updateOne(User);
const deleteUser = deleteOne(User);
const getUser = getOne(User);

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    message:
      'User has been deactived - Please contact the admin to re-active the user',
  });
});

const updateLoggedInUser = catchAsync(async (req, res, next) => {
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

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteMe,
  getUser,
  deleteUser,
  updateLoggedInUser,
};
