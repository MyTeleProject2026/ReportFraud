require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
    origin: [
        'https://reportfraud-ftc-admim-panel.onrender.com',
        'https://reportfraud.onrender.com',
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true
}));
// ✅ REMOVED the extra })); here
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'ReportFraud API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ReportFraud Backend running on port ${PORT}`);
});
