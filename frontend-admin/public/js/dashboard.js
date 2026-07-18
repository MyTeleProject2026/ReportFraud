// Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
  // Verify admin is logged in
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/';
    return;
  }
  
  // Load admin user
  const userData = localStorage.getItem('adminUser');
  if (userData) {
    const user = JSON.parse(userData);
    document.getElementById('adminUser').innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
  }
  
  // Load stats and recent reports
  loadDashboardData();
  
  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Sidebar toggle for mobile
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
});

async function loadDashboardData() {
  try {
    // Load stats
    const statsResponse = await API.getReportStats();
    if (statsResponse.success) {
      const stats = statsResponse.stats;
      document.getElementById('statTotal').textContent = stats.total || 0;
      document.getElementById('statPending').textContent = stats.pending || 0;
      document.getElementById('statReviewing').textContent = stats.reviewing || 0;
      document.getElementById('statInvestigating').textContent = stats.investigating || 0;
      document.getElementById('statResolved').textContent = stats.resolved || 0;
      document.getElementById('statRejected').textContent = stats.rejected || 0;
    }
    
    // Load recent reports
    const reportsResponse = await API.getReports({ page: 1, limit: 10 });
    if (reportsResponse.success) {
      renderReports(reportsResponse.data);
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    document.getElementById('recentReportsBody').innerHTML = `
            <tr><td colspan="7" class="text-center">Failed to load reports</td></tr>
        `;
  }
}

function renderReports(reports) {
  const tbody = document.getElementById('recentReportsBody');
  
  if (!reports || reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No reports found</td></tr>';
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
                <button class="btn btn-primary btn-sm view-report" data-id="${report.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
  
  // Add click handlers for view buttons
  tbody.querySelectorAll('.view-report').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `/reports.html?view=${btn.dataset.id}`;
    });
  });
}

async function handleLogout(e) {
  e.preventDefault();
  try {
    await API.logout();
  } catch (error) {
    // Ignore errors on logout
  }
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/';
}