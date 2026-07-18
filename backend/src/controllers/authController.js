const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/db');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const admin = await queryOne(
            'SELECT id, username, email, password_hash FROM admins WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                email: admin.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

const verify = async (req, res) => {
    try {
        const admin = await queryOne(
            'SELECT id, username, email FROM admins WHERE id = ?',
            [req.adminId]
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            admin
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    login,
    verify,
    logout
};