const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verify);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;