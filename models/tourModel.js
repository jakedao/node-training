const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Should provide tour name'],
    unique: true,
    trim: true, // Automatically remove whitespace
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'Tour must have a difficulty'],
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'Should provide tour price'],
  },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true, // Automatically remove whitespace
  },
  description: {
    type: String,
    trim: true, // Automatically remove whitespace
    required: [true, 'A tour must have a description1'],
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: {
    type: [Date],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
