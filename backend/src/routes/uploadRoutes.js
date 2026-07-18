const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

// Admin routes - require authentication
router.post('/image', authMiddleware, upload.single('image'), uploadController.uploadImage);
router.delete('/image', authMiddleware, uploadController.deleteImage);

module.exports = router;