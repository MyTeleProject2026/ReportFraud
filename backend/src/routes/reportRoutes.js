const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

// Public route - submit report
router.post('/submit', reportController.submitReport);

// Admin routes - require authentication
router.get('/', authMiddleware, reportController.getAllReports);
router.get('/stats', authMiddleware, reportController.getStats);
router.get('/:id', authMiddleware, reportController.getReportById);
router.put('/:id/status', authMiddleware, reportController.updateReportStatus);
// Add this route (public - no auth required)
router.get('/check/:reportNumber', reportController.getReportByNumber);
module.exports = router;
