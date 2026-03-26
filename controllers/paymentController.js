const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

// Create an order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;
        
        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency,
            receipt: receipt || `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).json({ status: 'error', message: 'Some error occurred generating order' });
        }

        res.json({ status: 'success', data: order, key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update booking status
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
