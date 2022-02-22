const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const TOURS_API = '/api/v1/tours';

const app = express();
const port = 3000;
app.use(morgan('dev'));
// app.use((req, res, next) => {
//   console.log('From middleware with hear 😍');
//   req.requestedAt = new Date().toISOString();
//   next();
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`)
);

app.get('/', (req, res) => {
  res.status(200).send('Hello from the server side ! 😙');
});

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tours,
      requestedTime: req.requestedAt,
    },
  });
};

const createTour = (req, res) => {
  const newTour = { ...req.body, _id: tours.length + 1 };
  fs.writeFile(
    '${__dirname}/dev-data/data/tours.json',
    JSON.stringify(newTour),
    (err) => {
      res.status(201).send(newTour);
    }
  );
};

const getTour = (req, res) => {
  const requestedParams = req.params;
  const foundData = tours.filter(({ _id }) => _id == requestedParams.id);

  if (foundData.length) {
    res.status(200).json({
      status: 'success',
      data: { tours: foundData },
    });
    return;
  }
  res.status(404).json({
    status: 'No data found',
    message: `This tour ID: ${req.params.id} is not available 😥`,
  });
};

const updateTour = (req, res) => {
  const requestedParams = req.params;
  const payload = req.body;
  const foundData = tours.filter(({ _id }) => _id == requestedParams.id);
  if (!Object.keys(payload).length) {
    res.status(400).json({
      status: 'Not Allowed',
      message: 'Not allow empty body',
    });
    return;
  }
  if (foundData.length) {
    const updatedData = { ...foundData[0], ...payload };
    fs.writeFile(
      '${__dirname}/dev-data/data/tours.json',
      JSON.stringify(updatedData),
      (err) => {
        res.status(200).json({
          status: 'success',
          data: {
            tour: { ...updatedData },
          },
        });
      }
    );
    return;
  }
  res.status(404).json({
    status: 'No data found',
    message: `This tour ID: ${req.params.id} is not available 😥`,
  });
};

const deleteTour = (req, res) => {
  const requestedParams = req.params;
  const foundData = tours.filter(({ _id }) => _id == requestedParams.id);
  if (foundData.length) {
    res.status(204).send('Tour has been deleted successful');
    return;
  }
  res.status(404).json({
    status: 'No data found',
    message: `This tour ID: ${req.params.id} is not available 😥`,
  });
};

app.route(TOURS_API).get(getAllTours).post(createTour);
app.route(`${TOURS_API}/:id`).get(getTour).patch(updateTour).delete(deleteTour);

app.listen(port, () => {
  console.log(`App is running on port ${port}....`);
});
