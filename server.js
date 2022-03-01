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

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Should provide tour name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'Should provide tour price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The camping snow',
  price: 615,
});

testTour
  .save()
  .then((res) => console.log('New tour created '))
  .catch((err) => console.log('Saving failed', err));

app.get('/', (req, res) => {
  res.status(200).send('Hello from the server side ! 😙');
});
app.listen(port, () => {
  console.log(`App is running on port ${port} ...`);
});
