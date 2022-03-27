const { DB_ERROR, TOKEN_ERROR } = require('../constants/error');
const AppError = require('../utils/appError');

const handleCastErrDB = (err) => {
  const message = `Invalid ${err.path} value ${err.value}`;
  return new AppError(message, 400);
};

const handleDubplicatedFieldsDB = (err) => {
  const errorField = { ...err.keyValue };

  const message = `Duplicated field ${Object.keys(errorField)[0]} with value: ${
    Object.values(errorField)[0]
  }`;
  return new AppError(message, 400);
};

const handleValidatonErrorDB = (err) => {
  const errorMsg = Object.keys(err.errors).reduce(
    (acc, error) => acc + `Field ${[error]}: ${err.errors[error].message} \n `,
    ''
  );
  return new AppError(errorMsg, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token - Please relog-in', 401);

const handleJWTExpired = (err) =>
  new AppError('Token expired - Please relog-in', 401);

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
  if (!err?.isOperational) {
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

// Global error handling - Main features
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // sending separate msg in different environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorMsgToDev(err, res);
  } else {
    let error = { ...err };

    // DB - Cast Id error handling
    if (err.name === DB_ERROR.CAST_ERROR) error = handleCastErrDB(err);

    // DB - field duplicated
    if (err.code === DB_ERROR.DUPLICATED_FIELDS)
      error = handleDubplicatedFieldsDB(err);

    // DB - Validation Error
    if (err.name === DB_ERROR.VALIDATION_ERORR)
      error = handleValidatonErrorDB(err);

    // TOKEN - handle token error
    if (err.name === TOKEN_ERROR.TOKEN_ERROR) error = handleJWTError(err);

    // TOKEN - handle token expired
    if (err.name === TOKEN_ERROR.TOKEN_EXPIRED) error = handleJWTExpired(err);

    sendErrorMsgToProd(error, res);
  }
};
