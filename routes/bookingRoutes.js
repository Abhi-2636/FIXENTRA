const express = require('express');
const { body, validationResult } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
    next();
};

router.use(protect); // Ensure user is logged in for all booking routes

// User Routes
router.post('/', restrictTo('user'), [
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required')
], validate, bookingController.createBooking);

router.get('/history', restrictTo('user'), bookingController.getUserHistory);
router.patch('/:id/cancel', restrictTo('user'), bookingController.cancelBooking);

// Provider Routes
router.get('/jobs', restrictTo('provider'), bookingController.getProviderJobs);
router.patch('/jobs/:id', restrictTo('provider'), [
    body('status').isIn(['accepted', 'completed', 'rejected']).withMessage('Invalid status')
], validate, bookingController.updateJobStatus);

// Admin Routes
router.get('/', restrictTo('admin'), bookingController.getAllBookings);
router.patch('/:id/assign', restrictTo('admin'), [
    body('providerId').notEmpty().withMessage('Provider ID is required')
], validate, bookingController.assignProvider);

module.exports = router;
