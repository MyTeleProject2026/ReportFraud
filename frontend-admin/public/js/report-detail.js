// ===== REPORT DETAIL =====
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Set admin user
    const userData = localStorage.getItem('adminUser');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('adminUser').innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
    }

    // Get report ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (!reportId) {
        document.getElementById('reportDetailContent').innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> No report ID provided.
                <a href="/reports.html">Back to Reports</a>
            </div>
        `;
        return;
    }

    loadReportDetail(reportId);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', function () {
        document.querySelector('.admin-sidebar').classList.toggle('open');
    });
});

async function loadReportDetail(id) {
    try {
        const response = await API.getReport(id);

        if (!response.success) {
            document.getElementById('reportDetailContent').innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i> ${response.message || 'Report not found.'}
                    <a href="/reports.html">Back to Reports</a>
                </div>
            `;
            return;
        }

        renderReportDetail(response.data);
    } catch (error) {
        console.error('Load report error:', error);
        document.getElementById('reportDetailContent').innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> Failed to load report.
                <a href="/reports.html">Back to Reports</a>
            </div>
        `;
    }
}

function renderReportDetail(report) {
    const container = document.getElementById('reportDetailContent');

    container.innerHTML = `
        <div class="report-detail-card">
            <!-- Header -->
            <div class="detail-header">
                <h2>Report #${report.report_number}</h2>
                <div class="detail-actions">
                    <span class="status-badge ${report.status}">${report.status}</span>
                    <span class="detail-date">Submitted: ${formatDate(report.submitted_at)}</span>
                </div>
            </div>

            <div class="detail-grid">

                <!-- ===== CATEGORY ===== -->
                <div class="detail-section">
                    <h3><i class="fas fa-tag"></i> Category</h3>
                    <p>${report.category_name || 'N/A'}</p>
                </div>

                <!-- ===== REPORTER INFORMATION ===== -->
                <div class="detail-section">
                    <h3><i class="fas fa-user"></i> Reporter Information</h3>
                    <div class="detail-row">
                        <span><strong>Name:</strong> ${report.first_name || 'N/A'} ${report.last_name || ''}</span>
                        <span><strong>Email:</strong> ${report.email || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Phone:</strong> ${report.phone || 'N/A'}</span>
                        <span><strong>Address:</strong> ${formatAddress(report)}</span>
                    </div>
                </div>

                <!-- ===== CITIZENSHIP & IDENTITY (NEW) ===== -->
                <div class="detail-section highlight-section">
                    <h3><i class="fas fa-id-card"></i> Citizenship & Identity</h3>
                    <div class="detail-row">
                        <span><strong>Citizenship Status:</strong> ${report.citizenship_status || 'N/A'}</span>
                        <span><strong>Document Type:</strong> ${report.document_type || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Document Number:</strong> <code>${report.document_number || 'N/A'}</code></span>
                    </div>
                </div>

                <!-- ===== INCIDENT DETAILS ===== -->
                <div class="detail-section">
                    <h3><i class="fas fa-file-alt"></i> Incident Details</h3>
                    <div class="detail-row">
                        <span><strong>Date:</strong> ${report.incident_date || 'N/A'}</span>
                        <span><strong>Amount Lost:</strong> ${report.amount_lost ? '$' + report.amount_lost : 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Payment Method:</strong> ${report.payment_method || 'N/A'}</span>
                    </div>
                    <div class="detail-description">
                        <strong>Description:</strong>
                        <p>${report.incident_description || 'N/A'}</p>
                    </div>
                </div>

                <!-- ===== SUSPECT INFORMATION ===== -->
                <div class="detail-section">
                    <h3><i class="fas fa-user-secret"></i> Suspect Information</h3>
                    <div class="detail-row">
                        <span><strong>Name:</strong> ${report.suspect_name || 'N/A'}</span>
                        <span><strong>Email:</strong> ${report.suspect_email || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Phone:</strong> ${report.suspect_phone || 'N/A'}</span>
                        <span><strong>Website:</strong> ${report.suspect_website || 'N/A'}</span>
                    </div>
                    ${report.suspect_image_url ? `
                        <div class="detail-suspect-image">
                            <strong>Suspect Image:</strong>
                            <br>
                            <img src="${report.suspect_image_url}" alt="Suspect Image" class="suspect-image" />
                        </div>
                    ` : ''}
                </div>

                <!-- ===== ADMIN NOTES ===== -->
                <div class="detail-section">
                    <h3><i class="fas fa-sticky-note"></i> Admin Notes</h3>
                    <textarea id="adminNotes" rows="3" placeholder="Add notes about this report...">${report.admin_notes || ''}</textarea>
                    <div class="detail-status-update">
                        <label for="statusSelect"><strong>Update Status:</strong></label>
                        <select id="statusSelect">
                            <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="reviewing" ${report.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                            <option value="investigating" ${report.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                            <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="rejected" ${report.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="btn btn-primary" id="updateReportBtn">
                            <i class="fas fa-save"></i> Update
                        </button>
                    </div>
                </div>
            </div>

            <!-- Back Button -->
            <div class="detail-back">
                <a href="/reports.html" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Reports
                </a>
            </div>
        </div>
    `;

    // Setup update handler
    document.getElementById('updateReportBtn').addEventListener('click', async function () {
        const status = document.getElementById('statusSelect').value;
        const notes = document.getElementById('adminNotes').value.trim();

        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        btn.disabled = true;

        try {
            const response = await API.updateReportStatus(report.id, status, notes);
            if (response.success) {
                alert('✅ Report updated successfully!');
                window.location.reload();
            } else {
                alert(response.message || 'Failed to update report.');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('An error occurred while updating.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// ===== HELPER FUNCTIONS =====
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

function formatAddress(report) {
    const parts = [report.address, report.city, report.state, report.zip_code, report.country];
    const filtered = parts.filter(p => p && p.trim());
    return filtered.length ? filtered.join(', ') : 'N/A';
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        await API.logout();
    } catch (error) {}
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/';
}
