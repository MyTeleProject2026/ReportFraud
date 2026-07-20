// ===== EMAIL SERVICE =====
const nodemailer = require('nodemailer');

// Create a transporter using SMTP (if configured)
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

const sendEmail = async (to, subject, htmlContent) => {
    try {
        // If SMTP is configured, send real email
        if (transporter) {
            const result = await transporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@reportfraud.com',
                to: to,
                subject: subject,
                html: htmlContent
            });
            return { success: true, messageId: result.messageId };
        }

        // If no SMTP, log the email (for testing)
        console.log('📧 EMAIL WOULD BE SENT:');
        console.log('  To:', to);
        console.log('  Subject:', subject);
        console.log('  Body:', htmlContent.substring(0, 200) + '...');

        return { success: true, messageId: 'test-' + Date.now() };

    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
