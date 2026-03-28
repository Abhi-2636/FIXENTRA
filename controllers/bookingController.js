const Booking = require('../models/Booking');
const User = require('../models/User');

// Create a booking
exports.createBooking = async (req, res) => {
    try {
        const Service = require('../models/Service');
        const Coupon = require('../models/Coupon');
        const {
            serviceId,
            providerId,
            address,
            date,
            timeSlot,
            paymentMethod,
            couponCode,
            locality,
            priorityType,
            issueNote,
            issuePhotoName,
            familyProfile,
            addressLabel
        } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found.' });

        let amount = service.price;
        let discount = 0;
        const normalizedPriority = priorityType === 'emergency' ? 'emergency' : 'standard';

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isValid()) {
                discount = coupon.discount;
                amount = amount - (amount * (discount / 100));
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        if (normalizedPriority === 'emergency') {
            amount = amount + (amount * 0.5);
        }
        amount = Math.round(amount);

        // Prevent double booking for same provider at same time
        if (providerId) {
            const existingBooking = await Booking.findOne({ providerId, date, timeSlot });
            if (existingBooking) {
                return res.status(400).json({ message: 'The provider is already booked for this time slot.' });
            }
        }

        const newBooking = await Booking.create({
            userId: req.user._id,
            serviceId,
            providerId,
            address,
            locality: locality || 'Patna',
            addressLabel: addressLabel || null,
            familyProfile: familyProfile || null,
            issueNote: issueNote || null,
            issuePhotoName: issuePhotoName || null,
            priorityType: normalizedPriority,
            date,
            timeSlot,
            paymentMethod: paymentMethod || 'cash',
            amount,
            discount,
            couponCode: couponCode ? couponCode.toUpperCase() : null
        });

        // WhatsApp Notification Mock (Patna users highly prefer WhatsApp)
        console.log(`\n\n✅ [WHATSAPP API MOCK] Message dispatched to ${req.user.phone || 'customer'}`);
        console.log(`"Fixentra: Booking Confirmed! 🚀 Your expert will arrive at ${timeSlot} on ${new Date(date).toDateString()}. Team Patna."\n\n`);

        res.status(201).json({
            status: 'success',
            data: { booking: newBooking }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// View assigned jobs for providers
exports.getProviderJobs = async (req, res) => {
    try {
        const jobs = await Booking.find({ providerId: req.user._id })
            .populate('userId', 'name phone email')
            .populate('serviceId', 'name category price');

        res.status(200).json({
            status: 'success',
            results: jobs.length,
            data: { jobs }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// Update job status (Provider)
exports.updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Provider status: accepted, completed, rejected
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, providerId: req.user._id },
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'No booking found for this provider.' });
        }

        res.status(200).json({
            status: 'success',
            data: { booking }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// View booking history for users
exports.getUserHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('serviceId', 'name category price')
            .populate('providerId', 'name phone');

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: { bookings }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// Admin: View all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email address')
            .populate('serviceId', 'name category price')
            .populate('providerId', 'name phone');

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: { bookings }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// Admin: Assign provider to booking
exports.assignProvider = async (req, res) => {
    try {
        const { providerId } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id,
            { providerId, status: 'assigned' },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        res.status(200).json({
            status: 'success',
            data: { booking }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Cancel a booking (User)
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized.' });
        }
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ message: 'This booking cannot be cancelled.' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            status: 'success',
            data: { booking }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
