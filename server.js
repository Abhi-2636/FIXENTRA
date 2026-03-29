require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const errorHandler = require('./middleware/error');

// Verify Supabase config
const { supabaseAdmin } = require('./config/supabase');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// ===== SECURITY MIDDLEWARE =====
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { status: 'error', message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { status: 'error', message: 'Too many login attempts. Try again in 15 minutes.' }
});
app.use('/api/auth/', authLimiter);

// Core Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(express.static('public', {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.set('Pragma', 'no-cache');
    }
}));
app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://fixentra.com', 'https://www.fixentra.com']
        : '*',
    credentials: true
}));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invoices', invoiceRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Mock IO behavior for serverless environments since WebSockets break
const mockIo = { on: () => {}, emit: () => {}, to: () => ({ emit: () => {} }) };
const io = process.env.SERVERLESS ? mockIo : new Server(server, { cors: { origin: '*' } });

// Attach socket IO to app so routes can use it
app.set('io', io);

// Handle WebSockets (only runs locally/containers)
if (!process.env.SERVERLESS) {
    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on('join_booking', (bookingId) => {
            socket.join(bookingId);
            console.log(`User joined booking room: ${bookingId}`);
        });

        socket.on('send_message', (data) => {
            socket.to(data.bookingId).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
}

if (!process.env.SERVERLESS) {
    server.listen(PORT, () => {
        console.log(`🚀 Fixentra running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`✅ Backend: Supabase (PostgreSQL)`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    });
}

// Export app for serverless wrappers
module.exports = app;
