const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true, min: 1, max: 100 }, // percentage
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    minOrderValue: { type: Number, default: 0 },
    description: { type: String, default: '' }
}, { timestamps: true });

couponSchema.methods.isValid = function() {
    return this.isActive && this.usedCount < this.maxUses && new Date() < this.expiresAt;
};

module.exports = mongoose.model('Coupon', couponSchema);
