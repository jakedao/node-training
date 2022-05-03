const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const deletedDocument = await Model.findByIdAndDelete(req.params.id);

    if (!deletedDocument)
      next(new AppError('No document found with that id', 404));

    res.status(204).json({
      status: 'success',
      message: 'Document deleted successful',
    });
  });
};

const createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });
};

const updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // validating req.body again whenever CREATE OR UPDATE
    });

    if (!updatedDoc) {
      return next(new AppError('No doc found with that Id', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Update document successfully',
      data: {
        data: updatedDoc,
      },
    });
  });
};

const getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // populating options if available
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) next(new AppError('No document found with that id', 404));

    res.status(200).json({
      status: 'success',
      data: { document },
    });
  });
};

const getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filter;
    // NESTED review in Tour - reviewedOn is the field where the tourId stored inside
    if (req.params.tourId) filter = { reviewedOn: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documents = await features.query;

    res.status(200).json({
      status: 'success',
      result: documents.length,
      data: { data: documents },
    });
  });
};

module.exports = { getAll, getOne, deleteOne, createOne, updateOne };
