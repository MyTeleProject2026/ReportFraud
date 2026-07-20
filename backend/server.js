require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./src/config/db');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const publicUploadRoutes = require('./src/routes/publicUploadRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const emailRoutes = require('./src/routes/emailRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: [
            'https://reportfraud-ftc-admim-panel.onrender.com',
            'https://reportfraud-ftc-admin-panel.onrender.com',
            'https://reportfraud.onrender.com',
            'http://localhost:3000',
            'http://localhost:3001'
        ],
        credentials: true,
        methods: ['GET', 'POST']
    }
});

app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(helmet());

app.use(cors({
    origin: [
        'https://reportfraud-ftc-admim-panel.onrender.com',
        'https://reportfraud-ftc-admin-panel.onrender.com',
        'https://reportfraud.onrender.com',
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicUploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);

// ===== ROOT ENDPOINTS (Welcome Messages) =====

// Root endpoint - shows when visiting https://reportfraud-ftc-gov-api.onrender.com
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ReportFraud Backend API is running',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            login: '/api/auth/login',
            reports: '/api/reports',
            categories: '/api/categories',
            settings: '/api/settings',
            upload: '/api/upload',
            chat: '/api/chat',
            email: '/api/email'
        },
        documentation: 'Use /api/health to check server status'
    });
});

// API root endpoint - shows when visiting /api
app.get('/api', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ReportFraud API v1.0',
        available_endpoints: [
            'GET /api/health',
            'POST /api/auth/login',
            'GET /api/reports',
            'GET /api/categories',
            'GET /api/settings',
            'GET /api/chat/:reportId',
            'POST /api/chat',
            'POST /api/email/send'
        ]
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'ReportFraud API is running' });
});

// ===== ERROR HANDLING =====

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        available: 'Visit / or /api to see available endpoints'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ============================================================
// ===== SOCKET.IO (REAL-TIME CHAT) =====
// ============================================================

io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    // ---- Join a specific report room ----
    socket.on('join-report', (reportId) => {
        if (reportId) {
            socket.join(`report_${reportId}`);
            console.log(`Socket ${socket.id} joined report_${reportId}`);
        }
    });

    // ---- Leave report room ----
    socket.on('leave-report', (reportId) => {
        if (reportId) {
            socket.leave(`report_${reportId}`);
            console.log(`Socket ${socket.id} left report_${reportId}`);
        }
    });

    // ---- Handle new chat message ----
    socket.on('send-message', async (data) => {
        try {
            const { report_id, message, sender_type, sender_name } = data;

            if (!report_id || !message || !sender_type) {
                socket.emit('message-error', { error: 'Missing required fields' });
                return;
            }

            // Import chat controller dynamically to save message
            const chatController = require('./src/controllers/chatController');
            
            // Save to database
            const result = await chatController.saveMessage(
                report_id,
                message,
                sender_type,
                sender_name || null
            );

            // Broadcast to everyone in the report room
            io.to(`report_${report_id}`).emit('new-message', {
                id: result.insertId,
                report_id: report_id,
                sender_type: sender_type,
                sender_name: sender_name || (sender_type === 'admin' ? 'Admin' : 'User'),
                message: message,
                created_at: new Date().toISOString()
            });

            // If sender is user, notify admin (for unread count)
            if (sender_type === 'user') {
                io.emit('user-message-notification', {
                    report_id: report_id,
                    message: message,
                    sender_name: sender_name || 'User'
                });
            }

        } catch (error) {
            console.error('Socket message error:', error);
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });

    // ---- Typing indicator ----
    socket.on('typing', (data) => {
        const { report_id, sender_type } = data;
        if (report_id) {
            socket.to(`report_${report_id}`).emit('user-typing', {
                sender_type: sender_type,
                isTyping: true
            });
        }
    });

    socket.on('stop-typing', (data) => {
        const { report_id } = data;
        if (report_id) {
            socket.to(`report_${report_id}`).emit('user-typing', {
                isTyping: false
            });
        }
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

// ============================================================
// ===== START SERVER =====
// ============================================================

server.listen(PORT, () => {
    console.log(`🚀 ReportFraud Backend running on port ${PORT}`);
    console.log(`🔌 Socket.IO server ready for real-time chat`);
});
