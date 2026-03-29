const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Validate a coupon code (public)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const { data: coupon, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !coupon) return res.status(404).json({ status: 'error', message: 'Invalid coupon code.' });

        const isValid = coupon.is_active && coupon.used_count < coupon.max_uses && new Date() < new Date(coupon.expires_at);
        if (!isValid) return res.status(400).json({ status: 'error', message: 'Coupon expired or fully used.' });

        res.json({ status: 'success', data: { discount: coupon.discount, description: coupon.description } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Admin: Create coupon
router.post('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { data: coupon, error } = await supabaseAdmin
            .from('coupons')
            .insert({
                code: req.body.code?.toUpperCase(),
                discount: Number(req.body.discount),
                max_uses: Number(req.body.maxUses) || 100,
                expires_at: req.body.expiresAt,
                is_active: req.body.isActive !== false,
                min_order_value: Number(req.body.minOrderValue) || 0,
                description: req.body.description || ''
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        res.status(201).json({ status: 'success', data: { coupon } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Admin: List all coupons
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { data: coupons, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        res.json({ status: 'success', data: { coupons } });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Admin: Delete coupon
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('coupons')
            .delete()
            .eq('id', req.params.id);

        if (error) throw new Error(error.message);
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

module.exports = router;
