const express = require('express');
const { verifyToken, restrict } = require('../controllers/authController');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTopCheap,
  getTourStats,
  getMonthlyPlan,
  getTourInRange,
  getTourDistance,
} = require('../controllers/tourController');

const reviewRouter = require('./reviewRoute');

const router = express.Router();

// Nested Route - Express Built-in
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-tours').get(getTopCheap, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.use(verifyToken);
router.route('/').get(getAllTours).post(restrict('admin'), createTour);
router.route('/range').get(getTourInRange);
router.route('/distance').get(getTourDistance);
router
  .route('/:id')
  .get(getTour)
  .patch(restrict(['guide', 'admin']), updateTour)
  .delete(restrict('admin'), deleteTour);

// nested route - NOT RECOMMEND
// router
//   .route('/:tourId/reviews')
//   .post(verifyToken, restrict('admin'), createReview);

module.exports = router;
