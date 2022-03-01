const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

const router = express.Router();

const checkBody = (req, res, next) => {
  if (!req.body?.name || !req.body?.price) {
    return res.status(400).json({
      status: 'failed',
      message: 'Request body is empty',
    });
  }
  next();
};

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
