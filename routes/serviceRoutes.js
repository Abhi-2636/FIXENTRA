const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);

// Admin-only routes
router.use(protect, restrictTo('admin'));
router.post('/', serviceController.createService);
router.patch('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
