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

// INDEX
reviewSchema.index({ reviewedOn: 1, reviewedBy: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { reviewedOn: tourId },
    },
    {
      $group: {
        _id: '$reviewedOn',
        totalRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    rating: stats[0]?.avgRating,
    ratingQuantity: stats[0]?.totalRating,
  });
};

// ONLY creating Reviewp
reviewSchema.pre('save', function (next) {
  this.constructor.calcAverageRating(this.reviewedOn);
  next();
});

// Recalculating rating when Update OR Delete - Regular Expression to for find Id and Update
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.original = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function (next) {
  // this.original = await this.findOne(); // => Not use this as the query already executed and no longer accessible

  await this.original.constructor.calcAverageRating(this.original.reviewedOn);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
