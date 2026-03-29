const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user in Supabase
        const { data: currentUser, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !currentUser) {
            return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
        }

        // Grant access
        req.user = currentUser;
        req.user._id = currentUser.id; // Compatibility alias
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token. Please log in again!' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action.' });
        }
        next();
    };
};
