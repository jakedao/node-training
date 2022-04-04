const Review = require('../models/reviewModel');
const { deleteOne, getOne, createOne, getAll } = require('./factoryHandler');

const populateNested = (req, res, next) => {
  const { reviewedBy, reviewedOn } = req.body;
  if (!reviewedOn) {
    this.reviewedOn = requestedParams.tourId;
  }

  if (!reviewedBy) {
    this.reviewedBy = req.user._id;
  }
  next();
};

const getReviews = getAll(Review);
const getReview = getOne(Review);
const createReview = createOne(Review);
const deleteReview = deleteOne(Review);

module.exports = {
  getReview,
  getReviews,
  createReview,
  deleteReview,
  populateNested,
};
