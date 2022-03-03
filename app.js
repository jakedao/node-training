const express = require('express');
const morgan = require('morgan');

const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');

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

module.exports = app;
