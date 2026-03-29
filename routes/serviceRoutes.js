const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');
const { serviceUpload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);

// Admin-only routes
router.use(protect, restrictTo('admin'));
router.post('/', serviceUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'gallery', maxCount: 6 }]), serviceController.createService);
router.patch('/:id', serviceUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'gallery', maxCount: 6 }]), serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
