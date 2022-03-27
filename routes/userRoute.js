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
} = require('../controllers/userController');

const { signUp, signIn } = require('../controllers/authController');
const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-password', verifyToken, updatePassword);
router.patch('/update-me', verifyToken, updateLoggedInUser);
router.delete('/delete-me', verifyToken, deleteMe);
router.post('/sign-up', signUp);
router.post('/sign-in', signIn);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
