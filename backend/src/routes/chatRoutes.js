// ===== CHAT ROUTES =====
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// Public routes (user can send/get messages without auth)
router.get('/:reportId', chatController.getMessages);
router.post('/', chatController.sendMessage);

// Admin routes (require auth)
router.put('/:reportId/read', authMiddleware, chatController.markAsRead);
router.get('/admin/unread', authMiddleware, chatController.getUnreadCount);

module.exports = router;
