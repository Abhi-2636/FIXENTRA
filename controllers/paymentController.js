const crypto = require('crypto');
const Booking = require('../models/Booking');

// Check if real Razorpay keys are configured
const hasRealKeys = process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('placeholder');

let razorpay = null;
if (hasRealKeys) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// Create an order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;
        
        if (razorpay) {
            // Real Razorpay flow
            const options = {
                amount: amount * 100,
                currency,
                receipt: receipt || `receipt_${Date.now()}`
            };
            const order = await razorpay.orders.create(options);
            if (!order) {
                return res.status(500).json({ status: 'error', message: 'Error generating order' });
            }
            res.json({ status: 'success', data: order, key_id: process.env.RAZORPAY_KEY_ID, mode: 'live' });
        } else {
            // Simulated payment flow (development mode)
            const simulatedOrder = {
                id: `order_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                amount: amount * 100,
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
                status: 'created'
            };
            res.json({ status: 'success', data: simulatedOrder, key_id: 'sim_dev_key', mode: 'simulation' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        let isAuthentic = false;

        if (hasRealKeys && razorpay_signature) {
            // Real Razorpay verification
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');
            isAuthentic = expectedSignature === razorpay_signature;
        } else if (razorpay_order_id && razorpay_order_id.startsWith('order_sim_')) {
            // Simulated payment is always authentic
            isAuthentic = true;
        }

        if (isAuthentic) {
            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
            }
            res.json({ status: 'success', message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ status: 'error', message: 'Payment verification failed' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

