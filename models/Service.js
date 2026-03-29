const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the service name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide the service category'],
        enum: ['maid', 'electrician', 'plumber', 'appliance repair', 'cleaning', 'carpenter', 'painter', 'pest control'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide the service price']
    },
    description: {
        type: String,
        trim: true
    },
    photo: {
        type: String,
        default: 'service-default.png'
    },
    gallery: {
        type: [String],
        default: []
    },
    included: {
        type: [String],
        default: []
    },
    durationMins: {
        type: Number,
        default: 60
    },
    baseEta: {
        type: Number,
        default: 28
    },
    rating: {
        type: Number,
        default: 4.8
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
