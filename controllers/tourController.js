const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getTopCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulity';
  console.log('It should moving to middle ware');
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      message: {
        tours: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  const requestedParams = req.params;
  try {
    const foundTour = await Tour.findById(requestedParams.id);
    if (foundTour) {
      res.status(200).json({
        message: 'success',
        tour: foundTour,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: 'No data found',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  const requestedParams = req.params;
  try {
    const tour = await Tour.findByIdAndUpdate(requestedParams.id, req.body, {
      new: true,
      runValidators: true, // validating req.body again
    });
    res.status(200).json({
      status: 'success',
      tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  const requestedParams = req.params;
  try {
    await Tour.findByIdAndDelete(requestedParams.id);
    res.status(204).json({
      status: 'success',
      message: 'The tour has been deleted successful',
    });
  } catch (err) {
    res.status(404).json({
      status: 'No data found',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
