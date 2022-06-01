const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const reviewRouter = require('./routes/reviewRoute');
const globalErrorHandler = require('./controllers/errorController');

const TOURS_API = '/api/v1/tours';
const USERS_API = '/api/v1/users';
const REVIEWS_API = '/api/v1/reviews';

// init app
const app = express();

// trust the proxy
app.enable("trust proxy")

// set secure http requests
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// prevent the brute force to try many time to get user credentials
const limiter = rateLimiter({
  max: 100, // number of request
  windowMs: 60 * 60 * 1000, // minute * second * miliseconds => 1 hour
  message: 'Too many request from this IP - please again after an hour',
});
app.use('/api', limiter);

// for parsing application/json => send json data in req.body
app.use(express.json());

// Data sanitization against SQL Injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: ['duration', 'price'],
  })
);

// app.use((req, res, next) => {
//   console.log('From middleware with hear 😍');
//   req.requestedAt = new Date().toISOString();
//   next();
// });

app.use(compression());

app.use(USERS_API, userRouter);
app.use(TOURS_API, tourRouter);
app.use(REVIEWS_API, reviewRouter);

// unhandled route handling
app.all('*', (req, res, next) => {
  // Passing err into next fucntion in middleware it will skip and go to global error middleware
  next(new AppError(`Page not found with the request ${req.originalUrl}`, 404));
});

// GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
