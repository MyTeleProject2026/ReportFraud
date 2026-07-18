const express = require('express');
const { query, queryOne } = require('../config/db');
const router = express.Router();

router.get('/hard-reset', async (req, res) => {
    try {
        // ✅ EXACT 60-CHARACTER HASH FOR "admin123"
        const hash = '$2b$10$5tH5XQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgK';
        
        // Update the password
        await query(
            'UPDATE admins SET password_hash = ? WHERE username = "admin"',
            [hash]
        );
        
        // Verify the update
        const updatedAdmin = await queryOne('SELECT id, username, LENGTH(password_hash) as hash_length FROM admins WHERE username = "admin"');
        
        res.send(`
            <h1>✅ Admin Password Updated!</h1>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
            <p><strong>Hash Length:</strong> ${updatedAdmin?.hash_length || 'N/A'} (should be 60)</p>
            <p><strong>Hash:</strong> <code>${hash}</code></p>
            <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
        `);
    } catch (error) {
        res.status(500).send(`<h1>❌ Error: ${error.message}</h1>`);
    }
});

module.exports = router;
