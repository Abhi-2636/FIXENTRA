const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a user']
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'A booking must belong to a service']
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional during booking, can be assigned later by admin or accepted by provider
    },
    address: {
        type: String,
        required: [true, 'A booking must have an address']
    },
    date: {
        type: Date,
        required: [true, 'A booking must have a date']
    },
    timeSlot: {
        type: String, // e.g., '10:00 AM - 11:00 AM'
        required: [true, 'A booking must have a time slot'],
        trim: true
    },
    locality: {
        type: String,
        trim: true,
        default: 'Patna'
    },
    addressLabel: {
        type: String,
        trim: true,
        default: null
    },
    familyProfile: {
        type: String,
        trim: true,
        default: null
    },
    issueNote: {
        type: String,
        trim: true,
        default: null
    },
    issuePhotoName: {
        type: String,
        trim: true,
        default: null
    },
    priorityType: {
        type: String,
        enum: ['standard', 'emergency'],
        default: 'standard'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'rejected', 'assigned', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'],
        default: 'cash'
    }
}, {
    timestamps: true
});

// To prevent double bookings for the same provider, date, and time slot
bookingSchema.index({ providerId: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { providerId: { $exists: true } } });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
