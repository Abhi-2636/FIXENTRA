const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Ensure user is logged in for all booking routes

// User Routes
router.post('/', restrictTo('user'), bookingController.createBooking);
router.get('/history', restrictTo('user'), bookingController.getUserHistory);

// Provider Routes
router.get('/jobs', restrictTo('provider'), bookingController.getProviderJobs);
router.patch('/jobs/:id', restrictTo('provider'), bookingController.updateJobStatus);

// Admin Routes
router.get('/', restrictTo('admin'), bookingController.getAllBookings);
router.patch('/:id/assign', restrictTo('admin'), bookingController.assignProvider);

module.exports = router;
