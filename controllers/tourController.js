const fs = require('fs');
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  const { ...queryParams } = req?.query;
  const excludedFields = ['page', 'sort', 'limit'];
  excludedFields.map((field) => delete queryParams[field]);
  try {
    //SOLUTION 1
    const query = Tour.find(queryParams); // return Query for later handling query - SHOULD NOT USE AWAIT to return the data

    // SOLUTION 2
    // const query = Tour.find().where('page').equals(2).where("difficulty").equals(2);
    const tour = await query;
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
  console.log('its getting tour ', requestedParams);
  try {
    const foundTour = await Tour.findById(requestedParams.id);
    console.log('all tours', foundTour);
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
