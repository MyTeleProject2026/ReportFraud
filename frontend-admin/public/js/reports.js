// ===== REPORTS PAGE =====
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const userData = localStorage.getItem('adminUser');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('adminUser').innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
    }

    let currentPage = 1;
    const limit = 20;
    let currentFilters = {};

    // Load reports
    loadReports();

    // Filter events
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('filterStatus').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    document.getElementById('filterSearch').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('detailModal').style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            document.getElementById('detailModal').style.display = 'none';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('sidebarToggle').addEventListener('click', function () {
        document.querySelector('.admin-sidebar').classList.toggle('open');
    });

    // ---- loadReports ----
    async function loadReports() {
        try {
            const params = { page: currentPage, limit, ...currentFilters };
            const response = await API.getReports(params);
            if (response.success) {
                renderReports(response.data, response.pagination);
            }
        } catch (error) {
            console.error('Load reports error:', error);
            document.getElementById('reportsBody').innerHTML = `
                <tr><td colspan="8" class="text-center">Failed to load reports</td></tr>
            `;
        }
    }

    function renderReports(reports, pagination) {
        const tbody = document.getElementById('reportsBody');

        if (!reports || reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No reports found</td></tr>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        tbody.innerHTML = reports.map(report => `
            <tr>
                <td><strong>${report.report_number}</strong></td>
                <td>${report.first_name} ${report.last_name}</td>
                <td>${report.email}</td>
                <td>${report.category_name || 'N/A'}</td>
                <td><span class="status-badge ${report.status}">${report.status}</span></td>
                <td>${report.citizenship_status || 'N/A'}</td>   <!-- ✅ NEW COLUMN -->
                <td>${new Date(report.submitted_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary btn-sm view-report-detail" data-id="${report.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Add click handlers for view buttons
        tbody.querySelectorAll('.view-report-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                openReportDetail(btn.dataset.id);
            });
        });

        renderPagination(pagination);
    }

    function renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!pagination || pagination.pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= pagination.pages; i++) {
            html += `<button class="${i === pagination.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        container.innerHTML = html;

        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                loadReports();
            });
        });
    }

    function applyFilters() {
        const status = document.getElementById('filterStatus').value;
        const search = document.getElementById('filterSearch').value.trim();

        currentFilters = {};
        if (status) currentFilters.status = status;
        if (search) currentFilters.search = search;
        currentPage = 1;
        loadReports();
    }

    function resetFilters() {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterSearch').value = '';
        currentFilters = {};
        currentPage = 1;
        loadReports();
    }

    // ---- Open Report Detail Modal ----
    async function openReportDetail(id) {
        try {
            const response = await API.getReport(id);
            if (response.success) {
                renderModalContent(response.data);
                document.getElementById('detailModal').style.display = 'flex';
            } else {
                alert('Report not found.');
            }
        } catch (error) {
            console.error('Open detail error:', error);
            alert('Failed to load report details.');
        }
    }

    function renderModalContent(report) {
        const container = document.getElementById('reportDetailContent');

        container.innerHTML = `
            <div class="report-detail-modal">
                <div class="detail-header">
                    <h3>Report #${report.report_number}</h3>
                    <span class="status-badge ${report.status}">${report.status}</span>
                </div>

                <!-- Reporter -->
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Reporter</h4>
                    <div class="detail-row">
                        <span><strong>Name:</strong> ${report.first_name || 'N/A'} ${report.last_name || ''}</span>
                        <span><strong>Email:</strong> ${report.email || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Phone:</strong> ${report.phone || 'N/A'}</span>
                        <span><strong>Address:</strong> ${formatAddress(report)}</span>
                    </div>
                </div>

                <!-- Citizenship & Identity (NEW) -->
                <div class="detail-section highlight-section">
                    <h4><i class="fas fa-id-card"></i> Citizenship & Identity</h4>
                    <div class="detail-row">
                        <span><strong>Citizenship:</strong> ${report.citizenship_status || 'N/A'}</span>
                        <span><strong>Document Type:</strong> ${report.document_type || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Document Number:</strong> <code>${report.document_number || 'N/A'}</code></span>
                    </div>
                </div>

                <!-- Incident -->
                <div class="detail-section">
                    <h4><i class="fas fa-file-alt"></i> Incident</h4>
                    <div class="detail-row">
                        <span><strong>Category:</strong> ${report.category_name || 'N/A'}</span>
                        <span><strong>Date:</strong> ${report.incident_date || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Amount:</strong> ${report.amount_lost ? '$' + report.amount_lost : 'N/A'}</span>
                        <span><strong>Payment:</strong> ${report.payment_method || 'N/A'}</span>
                    </div>
                    <div class="detail-description">
                        <strong>Description:</strong>
                        <p>${report.incident_description || 'N/A'}</p>
                    </div>
                </div>

                <!-- Suspect -->
                <div class="detail-section">
                    <h4><i class="fas fa-user-secret"></i> Suspect</h4>
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
                            <strong>Suspect Image:</strong><br>
                            <img src="${report.suspect_image_url}" alt="Suspect Image" class="suspect-image" />
                        </div>
                    ` : ''}
                </div>

                <!-- Admin Notes & Status Update -->
                <div class="detail-section">
                    <h4><i class="fas fa-sticky-note"></i> Admin Notes</h4>
                    <textarea id="adminNotesModal" rows="3" placeholder="Add notes...">${report.admin_notes || ''}</textarea>
                    <div class="detail-status-update">
                        <label for="statusSelectModal"><strong>Update Status:</strong></label>
                        <select id="statusSelectModal">
                            <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="reviewing" ${report.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                            <option value="investigating" ${report.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                            <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="rejected" ${report.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="btn btn-primary" id="updateReportModalBtn">
                            <i class="fas fa-save"></i> Update
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Setup update handler for modal
        document.getElementById('updateReportModalBtn').addEventListener('click', async function () {
            const status = document.getElementById('statusSelectModal').value;
            const notes = document.getElementById('adminNotesModal').value.trim();

            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            btn.disabled = true;

            try {
                const response = await API.updateReportStatus(report.id, status, notes);
                if (response.success) {
                    alert('✅ Report updated successfully!');
                    document.getElementById('detailModal').style.display = 'none';
                    loadReports(); // Refresh table
                } else {
                    alert(response.message || 'Failed to update.');
                }
            } catch (error) {
                console.error('Update error:', error);
                alert('An error occurred.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // ---- Helper functions ----
    function formatAddress(report) {
        const parts = [report.address, report.city, report.state, report.zip_code, report.country];
        const filtered = parts.filter(p => p && p.trim());
        return filtered.length ? filtered.join(', ') : 'N/A';
    }

    function handleLogout(e) {
        e.preventDefault();
        try { API.logout(); } catch (error) {}
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/';
    }
});
