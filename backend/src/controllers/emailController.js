// ===== EMAIL CONTROLLER =====
const { queryOne } = require('../config/db');
const { sendEmail } = require('../config/email');

const sendReportEmail = async (req, res) => {
    try {
        const { reportId, subject, message } = req.body;

        if (!reportId || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Report ID, subject, and message are required'
            });
        }

        // Get report details
        const report = await queryOne(
            'SELECT * FROM reports WHERE id = ?',
            [reportId]
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (!report.email) {
            return res.status(400).json({
                success: false,
                message: 'No email address found for this report'
            });
        }

        // Build the email template
        const emailHtml = buildEmailTemplate(report, subject, message);

        // Send the email
        const result = await sendEmail(
            report.email,
            `[ReportFraud] ${subject}`,
            emailHtml
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send email: ' + (result.error || 'Unknown error')
            });
        }
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending email'
        });
    }
};

function buildEmailTemplate(report, subject, userMessage) {
    const reportNumber = report.report_number || 'N/A';
    const userName = `${report.first_name || ''} ${report.last_name || ''}`.trim() || 'User';
    const status = report.status || 'Pending';
    const statusColors = {
        'pending': '#f39c12',
        'reviewing': '#3498db',
        'investigating': '#e67e22',
        'resolved': '#27ae60',
        'rejected': '#e74c3c'
    };
    const statusColor = statusColors[status] || '#95a5a6';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReportFraud Update</title>
    <style>
        body {
            font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: #003c78;
            padding: 24px 32px;
            border-bottom: 4px solid #1a73e8;
        }
        .header h1 {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            margin: 0;
        }
        .header .tagline {
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            margin-top: 4px;
        }
        .body {
            padding: 32px 32px 24px;
            color: #202124;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .message {
            font-size: 16px;
            line-height: 1.7;
            color: #3c4043;
            margin-bottom: 24px;
            white-space: pre-wrap;
        }
        .status-box {
            background: #f8f9fa;
            border-left: 4px solid ${statusColor};
            padding: 16px 20px;
            border-radius: 4px;
            margin-bottom: 24px;
        }
        .status-box strong {
            display: block;
            font-size: 14px;
            color: #5f6368;
            margin-bottom: 2px;
        }
        .status-box .status-value {
            font-size: 18px;
            font-weight: 700;
            color: ${statusColor};
            text-transform: uppercase;
        }
        .status-box .report-number {
            font-size: 14px;
            color: #5f6368;
            margin-top: 6px;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 12px;
        }
        .btn {
            display: inline-block;
            background: #003c78;
            color: #ffffff !important;
            padding: 14px 36px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .btn:hover {
            background: #002a55;
        }
        .btn-icon {
            margin-right: 8px;
        }
        .footer {
            padding: 20px 32px;
            background: #f8f9fa;
            font-size: 13px;
            color: #5f6368;
            border-top: 1px solid #e8eaed;
        }
        .footer a {
            color: #003c78;
            text-decoration: underline;
        }
        .footer .small-note {
            margin-top: 8px;
            font-size: 12px;
            color: #9aa0a6;
        }
        .divider {
            border-top: 1px solid #e8eaed;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .container { margin: 20px; }
            .header { padding: 20px; }
            .body { padding: 24px 20px; }
            .btn { padding: 12px 24px; font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 ReportFraud.ftc.gov</h1>
            <div class="tagline">Federal Trade Commission</div>
        </div>

        <div class="body">
            <div class="greeting">Dear ${userName},</div>

            <div class="message">${userMessage}</div>

            <div class="status-box">
                <strong>📊 Report Status</strong>
                <div class="status-value">${status}</div>
                <div class="report-number">📝 Report #: ${reportNumber}</div>
            </div>

            <div class="btn-container">
                <a href="https://reportfraud.onrender.com/check-report.html" class="btn">
                    <span class="btn-icon">🔍</span> Check Report Status
                </a>
            </div>

            <p style="font-size: 14px; color: #5f6368; text-align: center; margin-top: 8px;">
                Enter your Report Number: <strong>${reportNumber}</strong>
            </p>

            <div class="divider"></div>

            <div style="background: #f0f7ff; padding: 16px 20px; border-radius: 6px; margin-top: 16px;">
                <p style="font-size: 14px; margin: 0; color: #003c78;">
                    💬 <strong>Need immediate assistance?</strong><br>
                    <a href="https://reportfraud.onrender.com/check-report.html" style="color: #003c78; font-weight: 600;">
                        Start a Live Chat with our FTC Cyber Team →
                    </a>
                </p>
            </div>
        </div>

        <div class="footer">
            <p>
                This email was sent to you because you filed a report with ReportFraud.ftc.gov.
                If you did not file this report, please ignore this email.
            </p>
            <p>
                <a href="https://reportfraud.onrender.com">ReportFraud.ftc.gov</a> |
                <a href="#">Privacy Policy</a>
            </p>
            <div class="small-note">
                OMB CONTROL#: 3084-0169
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = { sendReportEmail };
