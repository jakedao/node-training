const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = 3000;

const DB = process.env.DATABASE_CONNECTION.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((res) => console.log('DB connection successful'));

app.get('/', (req, res) => {
  res.status(200).send('Hello from the server side ! 😙');
});

const server = app.listen(process.env.PORT, '0.0.0.0');

// Unhandle Reject handling
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandle rejection - server is shutting down...💥');
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log('SIGTERM RECEIVED. Server is shutting down gracefully ...');
  server.close(() => {
    console.log('Process terminated !');
  })
})
