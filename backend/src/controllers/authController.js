const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/db');

// ✅ Read admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // ✅ FIRST: Check against environment variables (plain text comparison)
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: 1,
                    username: ADMIN_USERNAME,
                    email: 'admin@reportfraud.com'
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            return res.json({
                success: true,
                token,
                admin: {
                    id: 1,
                    username: ADMIN_USERNAME,
                    email: 'admin@reportfraud.com'
                }
            });
        }

        // ❌ If env credentials fail, try database (fallback)
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
        // ✅ Allow environment-based admin to verify
        if (req.adminId === 1) {
            return res.json({
                success: true,
                admin: {
                    id: 1,
                    username: ADMIN_USERNAME,
                    email: 'admin@reportfraud.com'
                }
            });
        }

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
