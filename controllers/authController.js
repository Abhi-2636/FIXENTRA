const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const sendEmail = require('../utils/email');
const { getPublicProviders, resolveProviderImage } = require('../utils/catalog');

const registrationOtpStore = new Map();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const { password_hash, ...safeUser } = user;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: {
                ...safeUser,
                _id: safeUser.id  // Compatibility with frontend
            }
        }
    });
};

const hashOtpCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const cleanupExpiredRegistrationOtps = () => {
    const now = Date.now();
    for (const [token, entry] of registrationOtpStore.entries()) {
        if (entry.expiresAt <= now) {
            registrationOtpStore.delete(token);
        }
    }
};

const parseStringList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_err) {
        return String(value).split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
};

exports.requestRegistrationOtp = async (req, res) => {
    try {
        cleanupExpiredRegistrationOtps();
        const email = String(req.body.email || '').trim().toLowerCase();
        const name = String(req.body.name || '').trim();
        const password = String(req.body.password || '');

        if (!name || !email || password.length < 6) {
            return res.status(400).json({ message: 'Name, email, and a valid password are required.' });
        }

        // Check if user exists already
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const verificationCode = `${Math.floor(100000 + Math.random() * 900000)}`;
        const verificationToken = crypto.randomBytes(24).toString('hex');
        registrationOtpStore.set(verificationToken, {
            email,
            otpHash: hashOtpCode(verificationCode),
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        const emailResult = await sendEmail({
            email,
            subject: 'Your Fixentra verification code',
            message: `Use this verification code to complete your Fixentra signup: ${verificationCode}. This code expires in 10 minutes.`,
            html: `<p>Use this verification code to complete your Fixentra signup:</p><h2 style="letter-spacing:4px;">${verificationCode}</h2><p>This code expires in 10 minutes.</p>`
        });

        res.status(200).json({
            status: 'success',
            message: 'Verification code sent successfully.',
            data: {
                verificationToken,
                recipient: email,
                expiresInMinutes: 10,
                deliveryMode: emailResult.simulated ? 'demo' : 'email',
                otpPreview: emailResult.simulated ? verificationCode : undefined
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        cleanupExpiredRegistrationOtps();
        const verificationToken = req.body.verificationToken;
        const verificationCode = String(req.body.verificationCode || '').trim();
        const otpEntry = registrationOtpStore.get(verificationToken);

        if (!otpEntry || otpEntry.expiresAt <= Date.now()) {
            return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
        }

        if (otpEntry.email !== String(req.body.email || '').trim().toLowerCase()) {
            return res.status(400).json({ message: 'Verification email does not match this signup request.' });
        }

        if (otpEntry.otpHash !== hashOtpCode(verificationCode)) {
            return res.status(400).json({ message: 'Incorrect verification code.' });
        }

        // Check referral
        let referredByUser = null;
        if (req.body.referralCode) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('referral_code', req.body.referralCode.toUpperCase())
                .single();
            referredByUser = data;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(req.body.password, 12);

        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert({
                name: req.body.name,
                email: req.body.email.toLowerCase().trim(),
                password_hash: passwordHash,
                role: req.body.role || 'user',
                phone: req.body.phone,
                address: req.body.address,
                referred_by: referredByUser ? referredByUser.id : null,
                wallet_balance: referredByUser ? 100 : 0
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        registrationOtpStore.delete(verificationToken);

        // Give referrer bonus
        if (referredByUser) {
            await supabaseAdmin.rpc('increment_wallet', {
                user_id_param: referredByUser.id,
                amount_param: 100
            }).catch(() => {
                // Fallback: direct update
                supabaseAdmin.from('users')
                    .update({ wallet_balance: referredByUser.wallet_balance + 100 })
                    .eq('id', referredByUser.id);
            });
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

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error || !user || !user.password_hash) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        const isCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isCorrect) {
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
            let { data: mockUser } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', 'abhishek.patna@google.mock')
                .single();

            if (!mockUser) {
                const { data, error } = await supabaseAdmin
                    .from('users')
                    .insert({
                        name: 'Abhishek (Google User)',
                        email: 'abhishek.patna@google.mock',
                        google_id: 'mock-google-id-12345',
                        role: 'user',
                        phone: '+91 9999900000',
                        address: 'Boring Road, Patna',
                        wallet_balance: 200
                    })
                    .select()
                    .single();
                if (error) throw new Error(error.message);
                mockUser = data;
            }
            return createSendToken(mockUser, 200, res);
        }

        // REAL GOOGLE OAUTH
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub } = ticket.getPayload();

        let { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            const { data, error } = await supabaseAdmin
                .from('users')
                .insert({
                    name,
                    email,
                    google_id: sub,
                    role: 'user',
                    phone: 'Not provided',
                    address: 'Not provided'
                })
                .select()
                .single();
            if (error) throw new Error(error.message);
            user = data;
        }

        createSendToken(user, 200, res);
    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error);
        res.status(400).json({ message: 'Google authentication failed. Please try again later.' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', req.body.email?.toLowerCase().trim())
            .single();

        if (error || !user) return res.status(404).json({ message: 'No user found with that email address.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await supabaseAdmin.from('users').update({
            password_reset_token: hashedToken,
            password_reset_expires: expires
        }).eq('id', user.id);

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
            await supabaseAdmin.from('users').update({
                password_reset_token: null,
                password_reset_expires: null
            }).eq('id', user.id);
            return res.status(500).json({ message: 'Error sending email. Try again later.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('password_reset_token', hashedToken)
            .gt('password_reset_expires', new Date().toISOString())
            .single();

        if (error || !user) return res.status(400).json({ message: 'Token is invalid or has expired.' });

        const passwordHash = await bcrypt.hash(req.body.password, 12);

        await supabaseAdmin.from('users').update({
            password_hash: passwordHash,
            password_reset_token: null,
            password_reset_expires: null
        }).eq('id', user.id);

        const token = signToken(user.id);
        res.status(200).json({ status: 'success', token, data: { user: { ...user, _id: user.id } } });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateMe = async (req, res) => {
    try {
        if (req.body.password) {
            return res.status(400).json({ message: 'This route is not for password updates. Please use /reset-password.' });
        }

        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.phone) updates.phone = req.body.phone;
        if (req.body.address) updates.address = req.body.address;
        if (req.file) updates.profile_image = `uploads/providers/${req.file.filename}`;

        if (req.user.role === 'provider') {
            if (req.body.skills) updates.skills = parseStringList(req.body.skills);
            if (req.body.workingLocalities) updates.working_localities = parseStringList(req.body.workingLocalities);
            if (req.body.responseTimeMins) updates.response_time_mins = Number(req.body.responseTimeMins);
            if (req.body.experience) updates.experience = Number(req.body.experience);
        }

        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        updatedUser.profile_image = resolveProviderImage(updatedUser);

        res.status(200).json({
            status: 'success',
            data: { user: { ...updatedUser, _id: updatedUser.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getProviders = async (req, res) => {
    try {
        const { data: providers, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone, address, skills, experience, rating, completed_jobs, latitude, longitude, working_localities, response_time_mins, profile_image')
            .eq('role', 'provider');

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            results: providers.length,
            data: {
                providers: providers.map(p => ({
                    ...p,
                    _id: p.id,
                    profileImage: resolveProviderImage(p),
                    completedJobs: p.completed_jobs,
                    responseTimeMins: p.response_time_mins,
                    workingLocalities: p.working_localities
                }))
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getPublicProviderCatalog = async (req, res) => {
    try {
        const providers = await getPublicProviders({
            locality: req.query.locality || '',
            category: req.query.category || '',
            date: req.query.date || '',
            timeSlot: req.query.timeSlot || ''
        });

        res.status(200).json({
            status: 'success',
            results: providers.length,
            data: { providers }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
