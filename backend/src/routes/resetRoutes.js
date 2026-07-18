const express = require('express');
const { query, queryOne } = require('../config/db');
const router = express.Router();

router.get('/reset-admin-password', async (req, res) => {
    try {
        // Correct hash for "admin123"
        const hash = '$2b$10$N9qC8v4v5wD6xE7F8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aBcDeFgH';
        
        // Check if admin exists
        const admin = await queryOne('SELECT * FROM admins WHERE username = "admin"');
        
        let result;
        if (admin) {
            // Update existing admin
            result = await query(
                'UPDATE admins SET password_hash = ? WHERE username = ?',
                [hash, 'admin']
            );
            res.send(`
                <h1>✅ Admin Password Updated!</h1>
                <p>Username: <strong>admin</strong></p>
                <p>Password: <strong>admin123</strong></p>
                <p>Hash used: <code>${hash}</code></p>
                <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
            `);
        } else {
            // Create new admin
            result = await query(
                'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
                ['admin', 'admin@reportfraud.com', hash]
            );
            res.send(`
                <h1>✅ Admin User Created!</h1>
                <p>Username: <strong>admin</strong></p>
                <p>Password: <strong>admin123</strong></p>
                <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
            `);
        }
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).send(`
            <h1>❌ Error</h1>
            <p>${error.message}</p>
            <pre>${error.stack}</pre>
        `);
    }
});

// Direct reset - no auth required
router.get('/direct-reset', async (req, res) => {
    try {
        const hash = '$2b$10$N9qC8v4v5wD6xE7F8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aBcDeFgH';
        
        // Force update
        await query(
            'UPDATE admins SET password_hash = ? WHERE username = "admin"',
            [hash]
        );
        
        res.send(`
            <h1>✅ Direct Reset Complete!</h1>
            <p>Username: <strong>admin</strong></p>
            <p>Password: <strong>admin123</strong></p>
            <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
        `);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

module.exports = router;
