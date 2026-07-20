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
                <td>${report.first_name || ''} ${report.last_name || ''}</td>
                <td>${report.email || 'N/A'}</td>
                <td>${report.category_name || 'N/A'}</td>
                <td><span class="status-badge ${report.status}">${report.status}</span></td>
                <td>${report.citizenship_status || 'N/A'}</td>
                <td>${report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'N/A'}</td>
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
                <!-- Header -->
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

                <!-- Citizenship & Identity -->
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
                        <span><strong>Amount Lost:</strong> ${report.amount_lost ? '$' + report.amount_lost : 'N/A'}</span>
                        <span><strong>Payment Method:</strong> ${report.payment_method || 'N/A'}</span>
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
                    <textarea id="adminNotesModal" rows="3" placeholder="Add notes about this report...">${report.admin_notes || ''}</textarea>
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

                <!-- Submitted Info -->
                <div class="detail-footer">
                    <span>Submitted: ${report.submitted_at ? new Date(report.submitted_at).toLocaleString() : 'N/A'}</span>
                    ${report.updated_at ? `<span>Updated: ${new Date(report.updated_at).toLocaleString()}</span>` : ''}
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
// ===== ADD "SEND EMAIL" AND "LIVE CHAT" BUTTONS =====

// In renderReports function, update the action column:
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
            <td>${report.first_name || ''} ${report.last_name || ''}</td>
            <td>${report.email || 'N/A'}</td>
            <td>${report.category_name || 'N/A'}</td>
            <td><span class="status-badge ${report.status}">${report.status}</span></td>
            <td>${report.citizenship_status || 'N/A'}</td>
            <td>${report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-primary btn-sm view-report-detail" data-id="${report.id}" title="View Report">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-success btn-sm send-email-btn" data-id="${report.id}" data-email="${report.email || ''}" data-name="${report.first_name || ''} ${report.last_name || ''}" title="Send Email">
                    <i class="fas fa-envelope"></i>
                </button>
                <button class="btn btn-info btn-sm live-chat-btn" data-id="${report.id}" data-email="${report.email || ''}" data-name="${report.first_name || ''} ${report.last_name || ''}" title="Live Chat">
                    <i class="fas fa-comment-dots"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Add click handlers
    tbody.querySelectorAll('.view-report-detail').forEach(btn => {
        btn.addEventListener('click', () => openReportDetail(btn.dataset.id));
    });

    tbody.querySelectorAll('.send-email-btn').forEach(btn => {
        btn.addEventListener('click', () => openEmailModal(btn.dataset.id, btn.dataset.email, btn.dataset.name));
    });

    tbody.querySelectorAll('.live-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => openChatModal(btn.dataset.id, btn.dataset.name));
    });

    renderPagination(pagination);
}

// ===== EMAIL MODAL =====
function openEmailModal(reportId, userEmail, userName) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal email-modal';
    modal.id = 'emailModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content modal-email">
            <span class="modal-close" onclick="document.getElementById('emailModal').remove()">&times;</span>
            <h2><i class="fas fa-envelope"></i> Send Email to User</h2>
            <div class="email-form">
                <div class="form-group">
                    <label for="emailTo">To:</label>
                    <input type="email" id="emailTo" value="${userEmail}" readonly class="readonly-field">
                </div>
                <div class="form-group">
                    <label for="emailSubject">Subject:</label>
                    <input type="text" id="emailSubject" placeholder="Enter subject...">
                </div>
                <div class="form-group">
                    <label for="emailMessage">Message:</label>
                    <textarea id="emailMessage" rows="6" placeholder="Write your message to the user..."></textarea>
                </div>
                <div class="email-footer-note">
                    <p><i class="fas fa-info-circle"></i> A "Check Report Status" button will be automatically added to the email.</p>
                </div>
                <div class="email-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('emailModal').remove()">Cancel</button>
                    <button class="btn btn-primary" id="sendEmailBtn">
                        <i class="fas fa-paper-plane"></i> Send Email
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle send
    document.getElementById('sendEmailBtn').addEventListener('click', async function() {
        const subject = document.getElementById('emailSubject').value.trim();
        const message = document.getElementById('emailMessage').value.trim();

        if (!subject) {
            alert('Please enter a subject.');
            document.getElementById('emailSubject').focus();
            return;
        }
        if (!message) {
            alert('Please enter a message.');
            document.getElementById('emailMessage').focus();
            return;
        }

        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        try {
            const response = await fetch('https://reportfraud-ftc-gov-api.onrender.com/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    reportId: reportId,
                    subject: subject,
                    message: message
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Email sent successfully to ' + userEmail);
                document.getElementById('emailModal').remove();
            } else {
                alert('❌ Failed to send email: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Send email error:', error);
            alert('❌ Network error. Please try again.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// ===== CHAT MODAL =====
let chatPollingInterval = null;
let currentReportId = null;

function openChatModal(reportId, userName) {
    currentReportId = reportId;

    // Close any existing chat modal
    const existingChat = document.getElementById('chatModal');
    if (existingChat) {
        existingChat.remove();
        if (chatPollingInterval) {
            clearInterval(chatPollingInterval);
            chatPollingInterval = null;
        }
    }

    const modal = document.createElement('div');
    modal.className = 'modal chat-modal';
    modal.id = 'chatModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content modal-chat">
            <div class="chat-header">
                <div class="chat-header-info">
                    <span class="chat-online-dot"></span>
                    <div>
                        <h3>💬 Live Chat</h3>
                        <span class="chat-user-name">${userName || 'User'}</span>
                        <span class="chat-report-id">Report #: <span id="chatReportId">${reportId}</span></span>
                    </div>
                </div>
                <span class="modal-close" onclick="closeChatModal()">&times;</span>
            </div>
            <div class="chat-body" id="chatMessages">
                <div class="chat-loading">Loading messages...</div>
            </div>
            <div class="chat-footer">
                <div class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter') sendChatMessage()">
                    <button class="chat-send-btn" onclick="sendChatMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="chat-typing" id="chatTyping" style="display:none;">
                    <span>Admin is typing...</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Load messages
    loadChatMessages(reportId);

    // Start polling for new messages (every 3 seconds)
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
    }
    chatPollingInterval = setInterval(() => {
        loadChatMessages(reportId, true);
    }, 3000);
}

function closeChatModal() {
    const modal = document.getElementById('chatModal');
    if (modal) modal.remove();
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
}

async function loadChatMessages(reportId, silent = false) {
    try {
        const response = await fetch(`https://reportfraud-ftc-gov-api.onrender.com/api/chat/${reportId}`);
        const data = await response.json();

        if (data.success) {
            renderChatMessages(data.data);
            // Mark as read
            await fetch(`https://reportfraud-ftc-gov-api.onrender.com/api/chat/${reportId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
        }
    } catch (error) {
        if (!silent) {
            console.error('Load chat error:', error);
            document.getElementById('chatMessages').innerHTML = `
                <div class="chat-error">Failed to load messages. Please refresh.</div>
            `;
        }
    }
}

function renderChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="chat-empty">
                <i class="fas fa-comment-dots" style="font-size:2rem; color:#bdc1c6;"></i>
                <p>No messages yet.<br>Start the conversation!</p>
            </div>
        `;
        return;
    }

    // Check if we need to scroll to bottom
    const shouldScroll = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;

    container.innerHTML = messages.map(msg => {
        const isAdmin = msg.sender_type === 'admin';
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const senderName = msg.sender_name || (isAdmin ? 'Admin' : 'User');

        return `
            <div class="chat-message ${isAdmin ? 'admin' : 'user'}">
                <div class="chat-bubble ${isAdmin ? 'admin-bubble' : 'user-bubble'}">
                    <div class="chat-sender">${senderName}</div>
                    <div class="chat-text">${escapeHtml(msg.message)}</div>
                    <div class="chat-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');

    // Scroll to bottom if needed
    if (shouldScroll || messages.length > 0) {
        container.scrollTop = container.scrollHeight;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message || !currentReportId) return;

    input.value = '';
    input.disabled = true;

    try {
        const response = await fetch('https://reportfraud-ftc-gov-api.onrender.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                report_id: parseInt(currentReportId),
                message: message,
                sender_type: 'admin',
                sender_name: 'Admin'
            })
        });

        const data = await response.json();

        if (data.success) {
            // Reload messages
            loadChatMessages(currentReportId);
        } else {
            alert('Failed to send message: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Send message error:', error);
        alert('Network error. Please try again.');
    } finally {
        input.disabled = false;
        input.focus();
    }
}
