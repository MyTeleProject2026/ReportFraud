const { query, queryOne } = require('../config/db');
const { sanitizeInput } = require('../utils/helpers');

const getAllCategories = async (req, res) => {
  try {
    const { active_only } = req.query;
    let sql = 'SELECT * FROM categories';
    let params = [];
    
    if (active_only === 'true') {
      sql += ' WHERE is_active = 1';
    }
    
    sql += ' ORDER BY display_order ASC, name ASC';
    
    const categories = await query(sql, params);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, display_order, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    const existing = await queryOne('SELECT * FROM categories WHERE name = ?', [name.trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const result = await query(
      `INSERT INTO categories (name, description, display_order, is_active)
             VALUES (?, ?, ?, ?)`,
      [
        sanitizeInput(name.trim()),
        sanitizeInput(description || ''),
        display_order || 0,
        is_active !== undefined ? is_active : 1
      ]
    );
    
    const newCategory = await queryOne('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, display_order, is_active } = req.body;
    
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    if (name && name.trim() !== category.name) {
      const existing = await queryOne('SELECT * FROM categories WHERE name = ? AND id != ?', [name.trim(), id]);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }
    
    await query(
      `UPDATE categories 
             SET name = ?, description = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
      [
        name ? sanitizeInput(name.trim()) : category.name,
        description !== undefined ? sanitizeInput(description) : category.description,
        display_order !== undefined ? display_order : category.display_order,
        is_active !== undefined ? is_active : category.is_active,
        id
      ]
    );
    
    const updatedCategory = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category is used in reports
    const used = await queryOne('SELECT COUNT(*) as count FROM reports WHERE category_id = ?', [id]);
    if (used.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category because it is used in existing reports'
      });
    }
    
    await query('DELETE FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};