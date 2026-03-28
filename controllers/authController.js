const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined; // Remove password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = async (req, res) => {
    try {
        let referredByUser = null;
        if (req.body.referralCode) {
            referredByUser = await User.findOne({ referralCode: req.body.referralCode.toUpperCase() });
        }

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            phone: req.body.phone,
            address: req.body.address,
            referredBy: referredByUser ? referredByUser._id : undefined,
            walletBalance: referredByUser ? 100 : 0 // Bonus for using a code
        });

        if (referredByUser) {
            referredByUser.walletBalance += 100;
            await referredByUser.save({ validateBeforeSave: false });
        }

        createSendToken(newUser, 201, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password!' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken, mock } = req.body;

        // MOCK BYPASS FOR PATNA DEMO
        if (mock) {
            let mockUser = await User.findOne({ email: 'abhishek.patna@google.mock' });
            if (!mockUser) {
                mockUser = await User.create({
                    name: 'Abhishek (Google User)',
                    email: 'abhishek.patna@google.mock',
                    googleId: 'mock-google-id-12345',
                    role: 'user',
                    phone: '+91 9999900000',
                    address: 'Boring Road, Patna',
                    walletBalance: 200
                });
            }
            return createSendToken(mockUser, 200, res);
        }

        // REAL GOOGLE OAUTH
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                googleId: sub,
                role: 'user',
                phone: 'Not provided',
                address: 'Not provided'
            });
        }

        createSendToken(user, 200, res);
    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error);
        res.status(400).json({ message: 'Google authentication failed. Please try again later.' });
    }
};

const crypto = require('crypto');
const sendEmail = require('../utils/email');

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No user found with that email address.' });

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const appOrigin = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        const resetURL = `${appOrigin}/#reset-password?token=${resetToken}`;
        const message = `Forgot your password? Click here to reset it: ${resetURL}\nIf you didn't request this, ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your Password Reset Token (Valid for 10 min)',
                message,
                html: `<p>Forgot your password? Click here to reset it: <a href="${resetURL}">${resetURL}</a></p><p>If you didn't request this, ignore this email.</p>`
            });
            res.status(200).json({ status: 'success', message: 'Token sent to email!' });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Error sending email. Try again later.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Token is invalid or has expired.' });

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        });
        res.status(200).json({ status: 'success', token, data: { user } });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateMe = async (req, res) => {
    try {
        if (req.body.password) {
            return res.status(400).json({ message: 'This route is not for password updates. Please use /reset-password.' });
        }

        const filteredBody = {};
        if (req.body.name) filteredBody.name = req.body.name;
        if (req.body.phone) filteredBody.phone = req.body.phone;
        if (req.body.address) filteredBody.address = req.body.address;

        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: 'provider' })
            .select('name email phone address skills experience rating completedJobs location');

        res.status(200).json({
            status: 'success',
            results: providers.length,
            data: { providers }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
