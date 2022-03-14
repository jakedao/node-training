const { DB_ERROR } = require('../constants/error');
const AppError = require('../utils/appError');

const handleCastErrDB = (err) => {
  const message = `Invalid ${err.path} value ${err.value}`;
  return new AppError(message, 400);
};

const handleDubplicatedFields = (err) => {
  const errorField = { ...err.keyValue };

  console.log('checking', errorField);

  const message = `Duplicated field ${Object.keys(errorField)[0]} with value: ${
    Object.values(errorField)[0]
  }`;
  return new AppError(message, 400);
};

const sendErrorMsgToDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorMsgToProd = (err, res) => {
  // unhandle error - no showing raw errer msg to client
  if (!err.isOperational) {
    err.status = 'error';
    err.message = 'Something went wrong !!!';
    err.statusCode = 500;
    console.error('ERROR !!!');
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// Global error handling
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // sending separate msg in different environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorMsgToDev(err, res);
  } else {
    let error = { ...err };
    if (err.name === DB_ERROR.CAST_ERROR) error = handleCastErrDB(err);
    if (err.code === DB_ERROR.DUPLICATED_FIELDS)
      error = handleDubplicatedFields(err);
    sendErrorMsgToProd(error, res);
  }
};
