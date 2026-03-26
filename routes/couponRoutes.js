const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Validate a coupon code (public)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) return res.status(404).json({ status: 'error', message: 'Invalid coupon code.' });
        if (!coupon.isValid()) return res.status(400).json({ status: 'error', message: 'Coupon expired or fully used.' });
        res.json({ status: 'success', data: { discount: coupon.discount, description: coupon.description } });
    } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
});

// Admin: Create coupon
router.post('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ status: 'success', data: { coupon } });
    } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
});

// Admin: List all coupons
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt');
        res.json({ status: 'success', data: { coupons } });
    } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
});

// Admin: Delete coupon
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
});

module.exports = router;
