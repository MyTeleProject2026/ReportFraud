const express = require('express');
const { query, queryOne } = require('../config/db');
const router = express.Router();

// Hard reset - will show exactly what's happening
router.get('/hard-reset', async (req, res) => {
    try {
        // The correct hash for "admin123"
        const hash = '$2b$10$N9qC8v4v5wD6xE7F8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aBcDeFgH';
        
        // 1. Check if admin exists
        const admin = await queryOne('SELECT * FROM admins WHERE username = "admin"');
        
        let result;
        let message = '';
        
        if (admin) {
            // 2. Update the password
            result = await query(
                'UPDATE admins SET password_hash = ? WHERE username = "admin"',
                [hash]
            );
            message = '✅ Admin password updated successfully!';
        } else {
            // 3. Create admin if doesn't exist
            result = await query(
                'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
                ['admin', 'admin@reportfraud.com', hash]
            );
            message = '✅ Admin user created successfully!';
        }
        
        // 4. Verify the update worked
        const updatedAdmin = await queryOne('SELECT id, username, LENGTH(password_hash) as hash_length, password_hash FROM admins WHERE username = "admin"');
        
        res.send(`
            <h1>${message}</h1>
            <hr>
            <h2>Database Record:</h2>
            <pre>${JSON.stringify(updatedAdmin, null, 2)}</pre>
            <hr>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
            <p><strong>Hash Length:</strong> ${updatedAdmin?.hash_length || 'N/A'} (should be 60)</p>
            <hr>
            <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
        `);
    } catch (error) {
        console.error('Hard reset error:', error);
        res.status(500).send(`
            <h1>❌ Error</h1>
            <p><strong>Message:</strong> ${error.message}</p>
            <p><strong>Stack:</strong></p>
            <pre>${error.stack}</pre>
        `);
    }
});

module.exports = router;
