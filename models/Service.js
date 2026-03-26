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
        enum: ['maid', 'electrician', 'plumber', 'appliance repair', 'cleaning', 'carpenter'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide the service price']
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
