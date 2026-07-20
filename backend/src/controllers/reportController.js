const { query, queryOne } = require('../config/db');
const { generateReportNumber, sanitizeInput } = require('../utils/helpers');

const submitReport = async (req, res) => {
  try {
    // Destructure all fields, including category (string) and optional category_id (number)
    const {
      category,          // string from frontend (e.g., "job-investment")
      category_id,       // optional numeric ID (if frontend sends it)
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      incident_date,
      incident_description,
      amount_lost,
      currency,
      payment_method,
      suspect_name,
      suspect_email,
      suspect_phone,
      suspect_website,
      additional_info
    } = req.body;

    // Determine the final category_id
    let finalCategoryId = null;

    // 1. If category_id is provided and is a number, use it
    if (category_id && !isNaN(category_id)) {
      finalCategoryId = parseInt(category_id);
    }
    // 2. If category_id is a string (like "job-investment"), treat as category name and look up
    else if (category_id && isNaN(category_id)) {
      const cat = await queryOne('SELECT id FROM categories WHERE name = ?', [category_id]);
      finalCategoryId = cat ? cat.id : null;
    }
    // 3. If category (string) is provided and no category_id, look up by name
    else if (category) {
      const cat = await queryOne('SELECT id FROM categories WHERE name = ?', [category]);
      finalCategoryId = cat ? cat.id : null;
    }
    // If none provided, finalCategoryId remains null (will be stored as NULL)

    // Validate required fields
    if (!first_name || !last_name || !email || !incident_description) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and incident description are required'
      });
    }

    const reportNumber = generateReportNumber();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const result = await query(
      `INSERT INTO reports (
        report_number, category_id, first_name, last_name, email, phone,
        address, city, state, zip_code, country, incident_date,
        incident_description, amount_lost, currency, payment_method,
        suspect_name, suspect_email, suspect_phone, suspect_website,
        additional_info, ip_address, user_agent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportNumber,
        finalCategoryId,                      // <-- Use the resolved category ID
        sanitizeInput(first_name),
        sanitizeInput(last_name),
        sanitizeInput(email),
        sanitizeInput(phone || ''),
        sanitizeInput(address || ''),
        sanitizeInput(city || ''),
        sanitizeInput(state || ''),
        sanitizeInput(zip_code || ''),
        sanitizeInput(country || ''),
        incident_date || null,
        sanitizeInput(incident_description),
        amount_lost || null,
        currency || 'USD',
        sanitizeInput(payment_method || ''),
        sanitizeInput(suspect_name || ''),
        sanitizeInput(suspect_email || ''),
        sanitizeInput(suspect_phone || ''),
        sanitizeInput(suspect_website || ''),
        sanitizeInput(additional_info || ''),
        ipAddress,
        userAgent,
        'pending'
      ]
    );

    const newReport = await queryOne(
      'SELECT * FROM reports WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: newReport
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting report'
    });
  }
};

// --------------------------------------------------------------------
// The rest of the controller functions remain unchanged
// --------------------------------------------------------------------

const getAllReports = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    let params = [];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (r.first_name LIKE ? OR r.last_name LIKE ? OR r.email LIKE ? OR r.report_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countQuery = `SELECT COUNT(*) as total FROM reports r WHERE ${whereClause}`;
    const countResult = await queryOne(countQuery, params);
    const total = countResult.total;

    const dataQuery = `
      SELECT r.*, c.name as category_name 
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE ${whereClause}
      ORDER BY r.submitted_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);
    const reports = await query(dataQuery, params);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await queryOne(
      `SELECT r.*, c.name as category_name 
       FROM reports r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.id = ?`,
      [id]
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report'
    });
  }
};

const getReportByNumber = async (req, res) => {
    try {
        const { reportNumber } = req.params;

        const report = await queryOne(
            `SELECT 
                r.id,                // ✅ This is selected
                r.report_number, 
                r.status, 
                r.submitted_at, 
                r.updated_at,
                r.first_name,
                r.last_name,
                r.email,
                r.incident_description,
                c.name as category_name
             FROM reports r
             LEFT JOIN categories c ON r.category_id = c.id
             WHERE r.report_number = ?`,
            [reportNumber]
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found. Please check your report number.'
            });
        }

        // ✅ ADD THE ID FIELD TO THE RESPONSE
        res.json({
            success: true,
            data: {
                id: report.id,                    // ✅ ADD THIS LINE
                report_number: report.report_number,
                status: report.status,
                submitted_at: report.submitted_at,
                updated_at: report.updated_at,
                category: report.category_name || 'N/A',
                first_name: report.first_name,
                last_name: report.last_name,
                email: report.email,
                description: report.incident_description
            }
        });
    } catch (error) {
        console.error('Get report by number error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching report'
        });
    }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'reviewing', 'investigating', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const report = await queryOne('SELECT * FROM reports WHERE id = ?', [id]);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await query(
      'UPDATE reports SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, admin_notes || null, id]
    );

    const updatedReport = await queryOne('SELECT * FROM reports WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating report'
    });
  }
};

const getStats = async (req, res) => {
  try {
    const totalQuery = await queryOne('SELECT COUNT(*) as total FROM reports');
    const pendingQuery = await queryOne('SELECT COUNT(*) as pending FROM reports WHERE status = "pending"');
    const reviewingQuery = await queryOne('SELECT COUNT(*) as reviewing FROM reports WHERE status = "reviewing"');
    const investigatingQuery = await queryOne('SELECT COUNT(*) as investigating FROM reports WHERE status = "investigating"');
    const resolvedQuery = await queryOne('SELECT COUNT(*) as resolved FROM reports WHERE status = "resolved"');
    const rejectedQuery = await queryOne('SELECT COUNT(*) as rejected FROM reports WHERE status = "rejected"');

    const recentQuery = await query(
      'SELECT * FROM reports ORDER BY submitted_at DESC LIMIT 5'
    );

    res.json({
      success: true,
      stats: {
        total: totalQuery.total,
        pending: pendingQuery.pending,
        reviewing: reviewingQuery.reviewing,
        investigating: investigatingQuery.investigating,
        resolved: resolvedQuery.resolved,
        rejected: rejectedQuery.rejected
      },
      recent: recentQuery
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};

module.exports = {
  submitReport,
  getAllReports,
  getReportById,
  getReportByNumber,
  updateReportStatus,
  getStats
};
