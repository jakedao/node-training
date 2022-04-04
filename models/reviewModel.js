const mongoose = require('mongoose');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please leave your review on this tour'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'A tour should have a rating score'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    reviewedOn: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviewedOn',
    select: 'name',
  });
  next();
});
// reviewSchema.pre('save', async function (next) {
//   this.reviewedBy = await User.findById(this.reviewedBy).select(
//     'role name email'
//   );
//   this.reviewedOn = await Tour.findById(this.reviewedOn).select('name');
//   next();
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
