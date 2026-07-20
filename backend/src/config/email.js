// ===== EMAIL SERVICE =====
// Use Mailgun, SendGrid, or Resend
// For this example, we'll use Mailgun (free tier)

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

// Option 1: Mailgun
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || '',
    url: 'https://api.mailgun.net'
});

// Option 2: Resend (alternative)
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);

// Option 3: SendGrid (alternative)
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
    try {
        // Using Mailgun
        const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `ReportFraud <noreply@${process.env.MAILGUN_DOMAIN}>`,
            to: [to],
            subject: subject,
            html: htmlContent
        });
        return { success: true, messageId: result.id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
