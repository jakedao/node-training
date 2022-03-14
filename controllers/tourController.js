const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.getTopCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulity';
  console.log('It should moving to middle ware');
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tour = await features.query;

  // const tour = await Tour.find({}).limit(3).sort({ duration: -1 });

  res.status(200).json({
    status: 'success',
    result: tour.length,
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    message: {
      tours: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const requestedParams = req.params;
  const foundTour = await Tour.findById(requestedParams.id);

  if (!foundTour) {
    return next(new AppError(`No tour found with ${requestedParams.id}`, 404));
  }

  res.status(200).json({
    message: 'success',
    tour: foundTour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const requestedParams = req.params;
  const tour = await Tour.findByIdAndUpdate(requestedParams.id, req.body, {
    new: true,
    runValidators: true, // validating req.body again whenever CREATE OR UPDATE
  });

  if (!tour)
    return next(new AppError(`No tour found with ${requestedParams.id}`, 404));

  res.status(200).json({
    status: 'success',
    tour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const requestedParams = req.params;
  const tour = await Tour.findByIdAndDelete(requestedParams.id);

  if (!tour)
    return next(new AppError(`No tour found with ${requestedParams.id}`, 404));

  res.status(204).json({
    status: 'success',
    message: 'The tour has been deleted successful',
  });
});

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
