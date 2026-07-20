// ===== EMAIL ROUTES =====
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/auth');

// Admin only – send email (requires auth)
router.post('/send', authMiddleware, emailController.sendReportEmail);

module.exports = router;
