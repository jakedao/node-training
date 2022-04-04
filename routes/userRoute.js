const express = require('express');
const {
  resetPassword,
  verifyToken,
  restrict,
  forgotPassword,
  updatePassword,
} = require('../controllers/authController');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateLoggedInUser,
  deleteMe,
  getMe,
} = require('../controllers/userController');

const { signUp, signIn } = require('../controllers/authController');
const router = express.Router();

// public route
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.delete('/delete-me', deleteMe);
router.post('/sign-up', signUp);
router.post('/sign-in', signIn);

// authorized route
router.use(verifyToken);
router.patch('/update-password', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/update-me', updateLoggedInUser);

// authorized + permissions
router.use(restrict('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
