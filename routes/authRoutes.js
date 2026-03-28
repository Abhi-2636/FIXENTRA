const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
    next();
};

router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, authController.register);

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], validate, authController.login);

router.post('/google', authController.googleLogin);

router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], validate, authController.forgotPassword);

router.patch('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, authController.resetPassword);

const { protect, restrictTo } = require('../middleware/auth');
router.patch('/update-me', protect, authController.updateMe);
router.get('/providers', protect, restrictTo('admin'), authController.getProviders);

router.get('/config', (req, res) => {
    res.status(200).json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' });
});

module.exports = router;
