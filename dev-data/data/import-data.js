const fs = require('fs');
const dotenv = require('dotenv');
const moongose = require('mongoose');

const Tour = require('../../models/tourModel');
dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE_CONNECTION.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

moongose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((res) => console.log('DB connection successful'));

const importData = async () => {
  try {
    const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));
    await Tour.create(tour);
    console.log('Data imported successfully');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data cleared successfully');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else {
  deleteData();
}
