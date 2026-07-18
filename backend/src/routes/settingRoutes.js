const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');

// Public route - get all settings (for frontend user)
router.get('/', settingController.getSettings);
router.get('/:key', settingController.getSettingByKey);

// Admin routes - require authentication
router.put('/:key', authMiddleware, settingController.updateSetting);
router.put('/bulk/update', authMiddleware, settingController.updateMultipleSettings);

module.exports = router;