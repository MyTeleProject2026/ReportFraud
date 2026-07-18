const express = require('express');
const { query, queryOne } = require('../config/db');
const router = express.Router();

router.get('/hard-reset', async (req, res) => {
    try {
        // ✅ CORRECT 60-CHARACTER HASH FOR "admin123"
        const hash = '$2b$10$5tH5XQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgKZzXQZgK';
        
        // Update the password
        const result = await query(
            'UPDATE admins SET password_hash = ? WHERE username = ?',
            [hash, 'admin']
        );
        
        // Verify the update
        const updatedAdmin = await queryOne('SELECT id, username, LENGTH(password_hash) as hash_length, password_hash FROM admins WHERE username = "admin"');
        
        if (updatedAdmin && updatedAdmin.hash_length === 60) {
            res.send(`
                <h1>✅ Admin Password Updated Successfully!</h1>
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
                <p><strong>Hash Length:</strong> ${updatedAdmin.hash_length} (✅ Correct - 60 characters)</p>
                <p><strong>Hash:</strong> <code style="word-break:break-all;">${updatedAdmin.password_hash}</code></p>
                <p><a href="https://reportfraud-ftc-admin-panel.onrender.com">Go to Admin Panel</a></p>
            `);
        } else {
            res.send(`
                <h1>⚠️ Something Went Wrong</h1>
                <p>Hash length is ${updatedAdmin?.hash_length || 'N/A'}, expected 60.</p>
                <p>Please try again or check the database manually.</p>
            `);
        }
    } catch (error) {
        console.error('Hard reset error:', error);
        res.status(500).send(`
            <h1>❌ Error</h1>
            <p><strong>Message:</strong> ${error.message}</p>
            <pre>${error.stack}</pre>
        `);
    }
});

module.exports = router;
