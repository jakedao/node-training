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
app.listen(port, () => {
  console.log(`App is running on port ${port} ...`);
});
