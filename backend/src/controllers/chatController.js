// ===== CHAT CONTROLLER =====
const { query, queryOne } = require('../config/db');

// ---- SAVE MESSAGE (for Socket.IO) ----
const saveMessage = async (report_id, message, sender_type, sender_name) => {
    const result = await query(
        `INSERT INTO chats (report_id, sender_type, sender_name, message, is_read)
         VALUES (?, ?, ?, ?, ?)`,
        [report_id, sender_type, sender_name || null, message, sender_type === 'user' ? 0 : 1]
    );
    return result;
};

// ---- GET MESSAGES ----
const getMessages = async (req, res) => {
    try {
        const { reportId } = req.params;

        const messages = await query(
            `SELECT id, report_id, sender_type, sender_name, message, is_read, created_at
             FROM chats 
             WHERE report_id = ?
             ORDER BY created_at ASC`,
            [reportId]
        );

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages'
        });
    }
};

// ---- SEND MESSAGE (API) ----
const sendMessage = async (req, res) => {
    try {
        const { report_id, message, sender_type, sender_name } = req.body;

        if (!report_id || !message || !sender_type) {
            return res.status(400).json({
                success: false,
                message: 'Report ID, message, and sender type are required'
            });
        }

        if (!['admin', 'user'].includes(sender_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sender type'
            });
        }

        const result = await query(
            `INSERT INTO chats (report_id, sender_type, sender_name, message, is_read)
             VALUES (?, ?, ?, ?, ?)`,
            [report_id, sender_type, sender_name || null, message, sender_type === 'user' ? 0 : 1]
        );

        const newMessage = await queryOne(
            'SELECT * FROM chats WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};

// ---- MARK AS READ ----
const markAsRead = async (req, res) => {
    try {
        const { reportId } = req.params;

        await query(
            'UPDATE chats SET is_read = 1 WHERE report_id = ? AND sender_type = "user" AND is_read = 0',
            [reportId]
        );

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
};

// ---- GET UNREAD COUNT ----
const getUnreadCount = async (req, res) => {
    try {
        const result = await queryOne(
            'SELECT COUNT(*) as count FROM chats WHERE sender_type = "user" AND is_read = 0'
        );

        res.json({
            success: true,
            count: result.count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
};

// ---- EXPORT ALL ----
module.exports = {
    saveMessage,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount
};
