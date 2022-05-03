const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  createOne,
  updateOne,
  getAll,
  getOne,
} = require('./factoryHandler');

exports.getTour = getOne(Tour, {
  path: 'guides reviews',
  select: '-__v -role',
});
exports.getAllTours = getAll(Tour);
exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.getTopCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulity';
  console.log('It should moving to middle ware');
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { duration: { $gte: 5 } },
    },
    {
      $group: {
        _id: '$difficulty', // This will group by the field assigned to _id
        numTours: { $sum: 1 },
        numRatings: { $avg: '$ratingQuantity' },
        avgRatings: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        maxPrice: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    total: stats.length,
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const selectedYear = req.params.year * 1;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${selectedYear}-01-01`),
          $lte: new Date(`${selectedYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { month: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

exports.getTourInRange = catchAsync(async (req, res, next) => {
  const { long, lat, distance, unit } = req.query;
  console.log('checking quuery', req.query);

  const EARTH_RADIUS_IN_MI = 3963.2;
  const EARTH_RADIUS_IN_KM = 6378.1;

  const radius =
    unit === 'mi'
      ? distance / EARTH_RADIUS_IN_MI
      : distance / EARTH_RADIUS_IN_KM;

  if (!long || !lat) {
    return next(new AppError('Please provide long and lat fields', 400));
  }

  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lat, long], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});

exports.getTourDistance = catchAsync(async (req, res, next) => {
  const { long, lat, unit } = req.query;
  const METER_TO_MILES = 0.000621371192;
  const METER_TO_KM = 0.001;
  const multipler = unit === 'mi' ? METER_TO_MILES : METER_TO_KM;

  if (!long || !lat) {
    return next(new AppError('Please provide long and lat fields', 400));
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multipler,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distance,
    },
  });
});
