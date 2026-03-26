const Booking = require('../models/Booking');
const User = require('../models/User');

// Create a booking
exports.createBooking = async (req, res) => {
    try {
        const { serviceId, providerId, address, date, timeSlot } = req.body;
        
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
            date,
            timeSlot
        });

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
