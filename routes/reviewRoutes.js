const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a provider (public)
router.get('/providers/:providerId', reviewController.getProviderReviews);

// Logged in users only
router.use(protect);
router.post('/', restrictTo('user'), reviewController.createReview);

module.exports = router;
