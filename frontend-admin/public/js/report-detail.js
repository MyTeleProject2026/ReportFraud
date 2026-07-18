// Admin Reports

let currentPage = 1;
const limit = 20;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', () => {
  // Verify admin
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
  
  // Load reports
  loadReports();
  
  // Setup filters
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('filterStatus').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') applyFilters();
  });
  document.getElementById('filterSearch').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') applyFilters();
  });
  
  // Setup modal close
  document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('detailModal').style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) {
      document.getElementById('detailModal').style.display = 'none';
    }
  });
  
  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.querySelector('.admin-sidebar').classList.toggle('open');
  });
  
  // Check for view parameter
  const urlParams = new URLSearchParams(window.location.search);
  const viewId = urlParams.get('view');
  if (viewId) {
    openReportDetail(viewId);
  }
});

async function loadReports() {
  try {
    const params = { page: currentPage, limit, ...currentFilters };
    const response = await API.getReports(params);
    if (response.success) {
      renderReports(response.data, response.pagination);
    }
  } catch (error) {
    console.error('Failed to load reports:', error);
    document.getElementById('reportsBody').innerHTML = `
            <tr><td colspan="7" class="text-center">Failed to load reports</td></tr>
        `;
  }
}

function renderReports(reports, pagination) {
  const tbody = document.getElementById('reportsBody');
  
  if (!reports || reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No reports found</td></tr>';
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
            <td>${new Date(report.submitted_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary btn-sm view-report-detail" data-id="${report.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
  
  // Add click handlers
  tbody.querySelectorAll('.view-report-detail').forEach(btn => {
    btn.addEventListener('click', () => openReportDetail(btn.dataset.id));
  });
  
  // Render pagination
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

async function openReportDetail(id) {
  try {
    const response = await API.getReport(id);
    if (response.success) {
      const report = response.data;
      renderReportDetail(report);
      document.getElementById('detailModal').style.display = 'flex';
    } else {
      alert('Report not found.');
    }
  } catch (error) {
    console.error('Failed to load report detail:', error);
    alert('Failed to load report details.');
  }
}

function renderReportDetail(report) {
  const container = document.getElementById('reportDetailContent');
  
  container.innerHTML = `
        <div class="report-detail">
            <div class="detail-header">
                <h3>Report #${report.report_number}</h3>
                <div>
                    <span class="status-badge ${report.status}">${report.status}</span>
                    <span style="font-size:0.85rem;color:var(--gray-600);margin-left:12px;">
                        Submitted: ${new Date(report.submitted_at).toLocaleString()}
                    </span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Reporter Information</h4>
                <div class="detail-grid">
                    <div><strong>Name:</strong> ${report.first_name} ${report.last_name}</div>
                    <div><strong>Email:</strong> ${report.email}</div>
                    <div><strong>Phone:</strong> ${report.phone || 'N/A'}</div>
                    <div><strong>Address:</strong> ${report.address || 'N/A'}</div>
                    <div><strong>City:</strong> ${report.city || 'N/A'}</div>
                    <div><strong>State:</strong> ${report.state || 'N/A'}</div>
                    <div><strong>Zip Code:</strong> ${report.zip_code || 'N/A'}</div>
                    <div><strong>Country:</strong> ${report.country || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Incident Details</h4>
                <div class="detail-grid">
                    <div><strong>Category:</strong> ${report.category_name || 'N/A'}</div>
                    <div><strong>Incident Date:</strong> ${report.incident_date || 'N/A'}</div>
                    <div><strong>Amount Lost:</strong> ${report.amount_lost ? `${report.currency || 'USD'} ${report.amount_lost}` : 'N/A'}</div>
                    <div><strong>Payment Method:</strong> ${report.payment_method || 'N/A'}</div>
                </div>
                <div style="margin-top:12px;">
                    <strong>Description:</strong>
                    <p style="background:var(--gray-50);padding:12px;border-radius:var(--radius);margin-top:4px;">${report.incident_description}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Suspect Information</h4>
                <div class="detail-grid">
                    <div><strong>Name:</strong> ${report.suspect_name || 'N/A'}</div>
                    <div><strong>Email:</strong> ${report.suspect_email || 'N/A'}</div>
                    <div><strong>Phone:</strong> ${report.suspect_phone || 'N/A'}</div>
                    <div><strong>Website:</strong> ${report.suspect_website || 'N/A'}</div>
                </div>
                ${report.additional_info ? `
                    <div style="margin-top:12px;">
                        <strong>Additional Info:</strong>
                        <p style="background:var(--gray-50);padding:12px;border-radius:var(--radius);margin-top:4px;">${report.additional_info}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h4>Admin Actions</h4>
                <div class="detail-actions">
                    <div class="form-group" style="flex:1;">
                        <label for="reportStatus">Update Status</label>
                        <select id="reportStatus">
                            <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="reviewing" ${report.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                            <option value="investigating" ${report.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                            <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="rejected" ${report.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex:2;">
                        <label for="reportNotes">Admin Notes</label>
                        <textarea id="reportNotes" rows="2" placeholder="Add notes about this report...">${report.admin_notes || ''}</textarea>
                    </div>
                    <button class="btn btn-primary" id="updateReportBtn" style="align-self:flex-end;">
                        <i class="fas fa-save"></i> Update
                    </button>
                </div>
            </div>
        </div>
    `;
  
  // Setup update handler
  document.getElementById('updateReportBtn').addEventListener('click', async () => {
    const status = document.getElementById('reportStatus').value;
    const notes = document.getElementById('reportNotes').value.trim();
    
    const btn = document.getElementById('updateReportBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    btn.disabled = true;
    
    try {
      const response = await API.updateReportStatus(report.id, status, notes);
      if (response.success) {
        alert('Report updated successfully!');
        document.getElementById('detailModal').style.display = 'none';
        loadReports();
      } else {
        alert(response.message || 'Failed to update report.');
      }
    } catch (error) {
      console.error('Update report error:', error);
      alert('An error occurred while updating the report.');
    } finally {
      btn.innerHTML = '<i class="fas fa-save"></i> Update';
      btn.disabled = false;
    }
  });
}

async function handleLogout(e) {
  e.preventDefault();
  try {
    await API.logout();
  } catch (error) {
    // Ignore
  }
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/';
}