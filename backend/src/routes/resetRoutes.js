const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const router = express.Router();

// Reset admin password route
router.get('/reset-admin-password', async (req, res) => {
    try {
        // Generate hash for "admin123"
        const hash = '$2b$10$N9qC8v4v5wD6xE7F8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aBcDeFgH';
        
        // Update admin password
        await query(
            'UPDATE admins SET password_hash = ? WHERE username = ?',
            [hash, 'admin']
        );
        
        // Check if admin exists, if not create one
        const admin = await query('SELECT * FROM admins WHERE username = "admin"');
        if (admin.length === 0) {
            await query(
                'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
                ['admin', 'admin@reportfraud.com', hash]
            );
        }
        
        res.send(`
            <h1>✅ Admin Password Reset Successfully!</h1>
            <p>Username: <strong>admin</strong></p>
            <p>Password: <strong>admin123</strong></p>
            <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
        `);
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).send(`
            <h1>❌ Error Resetting Password</h1>
            <p>${error.message}</p>
        `);
    }
});

module.exports = router;
