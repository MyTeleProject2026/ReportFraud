const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

// Public route - get all categories (for frontend user)
router.get('/', categoryController.getAllCategories);

// Admin routes - require authentication
router.get('/:id', authMiddleware, categoryController.getCategoryById);
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;