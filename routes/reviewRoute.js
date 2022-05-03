const express = require('express');
const {
  getReviews,
  createReview,
  getReview,
  deleteReview,
  populateNested,
  updateReview,
} = require('../controllers/reviewController');
const { verifyToken, restrict } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(verifyToken, populateNested, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(verifyToken, updateReview)
  .delete(verifyToken, restrict('admin'), deleteReview);

module.exports = router;
