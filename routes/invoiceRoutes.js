const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Ensure user is logged in
router.get('/:bookingId', invoiceController.generateInvoice);

module.exports = router;
