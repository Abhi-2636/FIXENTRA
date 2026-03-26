const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Ensure user is logged in
router.post('/order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
