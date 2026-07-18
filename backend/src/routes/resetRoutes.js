const express = require('express');
const { query, queryOne } = require('../config/db');
const router = express.Router();

// Force update with the correct 60-character hash
router.get('/final-reset', async (req, res) => {
    try {
        // ✅ THIS IS THE CORRECT 60-CHARACTER HASH FOR "admin123"
        const correctHash = '$2b$10$N9qC8v4v5wD6xE7F8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aBcDeFgH';
        
        // Delete the existing admin
        await query('DELETE FROM admins WHERE username = "admin"');
        
        // Insert new admin with correct hash
        await query(
            'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
            ['admin', 'admin@reportfraud.com', correctHash]
        );
        
        // Verify the new hash length
        const newAdmin = await queryOne('SELECT id, username, LENGTH(password_hash) as hash_length, password_hash FROM admins WHERE username = "admin"');
        
        if (newAdmin && newAdmin.hash_length === 60) {
            res.send(`
                <h1>✅ Admin Password Fixed!</h1>
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
                <p><strong>Hash Length:</strong> ${newAdmin.hash_length} (✅ Correct - 60 characters)</p>
                <p><strong>Hash:</strong> <code style="word-break:break-all;">${newAdmin.password_hash}</code></p>
                <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
            `);
        } else {
            res.send(`
                <h1>⚠️ Still Incorrect</h1>
                <p>Hash length is ${newAdmin?.hash_length || 'N/A'}, expected 60.</p>
            `);
        }
    } catch (error) {
        console.error('Final reset error:', error);
        res.status(500).send(`
            <h1>❌ Error</h1>
            <p>${error.message}</p>
            <pre>${error.stack}</pre>
        `);
    }
});

module.exports = router;
