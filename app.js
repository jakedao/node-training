const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const globalErrorHandler = require('./controllers/errorController');

const TOURS_API = '/api/v1/tours';
const USERS_API = '/api/v1/users';

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json()); // // for parsing application/json => send json data in req.body
// app.use((req, res, next) => {
//   console.log('From middleware with hear 😍');
//   req.requestedAt = new Date().toISOString();
//   next();
// });

app.use(USERS_API, userRouter);
app.use(TOURS_API, tourRouter);

// unhandled route handling
app.all('*', (req, res, next) => {
  // Passing err into next fucntion in middleware it will skip and go to global error middleware
  next(new AppError(`Page not found with the request ${req.originalUrl}`, 404));
});

// GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
