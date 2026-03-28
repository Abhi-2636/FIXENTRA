const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; }, // Only required if NOT using Google login
        minlength: 6,
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values but ensures unique IDs if present
    },
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user'
    },
    // Provider Profile Fields
    profileImage: { type: String, default: 'default.png' },
    skills: [String],
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    completedJobs: { type: Number, default: 0 },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    address: {
        type: String,
        required: [true, 'Please provide your address']
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            default: [85.1376, 25.6093] // Default: Patna, Bihar
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    walletBalance: { type: Number, default: 0 }
}, {
    timestamps: true
});

userSchema.pre('save', async function() {
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
});

userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
