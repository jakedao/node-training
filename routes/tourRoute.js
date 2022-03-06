const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTopCheap,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

router.route('/top-5-tours').get(getTopCheap, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
