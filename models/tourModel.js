const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Should provide tour name'],
      unique: true,
      trim: true, // Automatically remove whitespace
      maxlength: [20, 'The tour name should be <= 20'],
      minlength: [5, 'The tour name should >= 5'],
    },
    customerEmail: {
      type: String,
      validate: [
        validator.isEmail, // using third-party validator
        'Should be provided an string with email format (E.g: abc@email.com)',
      ],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulty should be easy or medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should above 1.0 '],
      max: [5, 'Rating should below 5.0'],
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
      validate: {
        message: 'Discount price {VALUE} should be below the regular price',
        validator: function (value) {
          // this keyword is only accessible when creating a NEW DOCUMENT
          return value < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true, // Automatically remove whitespace
    },
    description: {
      type: String,
      trim: true, // Automatically remove whitespace
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
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
    secretTour: { type: Boolean, default: false },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // this is referencing to User Model
      },
    ],
  },
  // for virtual object - using in response not change model
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VIRTUAL
tourSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(2);
});

// virtual populating
tourSchema.virtual('reviews', {
  ref: 'Review', // Model to ref
  localField: '_id', // reference to corresponding field in local Modal
  foreignField: 'reviewedOn', // field in Refererence Model
});

// DOCUMENT MIDDLEWARE: run before save() and create() DOCUMENT
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedded User Model into guide properties - JUST FOR DEMO EMBEDDED DATA
// tourSchema.pre('save', async function (next) {
//   // iterate over the User model to find the matched users
//   const guidePromises = this.guides.map(
//     async (userId) => await User.findById(userId)
//   );

//   this.guides = await Promise.all(guidePromises);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log('its running after ');
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE - run before find()
// tourSchema.pre('find', function (next) {
//   console.log("IT's querying");
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  // this.find({ secretTour: { $ne: true } });
  // console.log(
  //   'It should be fire in any Find method include findById(), findOne()'
  // );
  next();
});

//AGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: false } } });
  console.log('Middle ware from aggregating', this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
