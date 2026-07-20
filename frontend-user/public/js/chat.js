// ===== USER CHAT LOGIC =====
let currentReportId = null;
let currentReportNumber = null;
let chatPollingInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportNumber = urlParams.get('report');

    if (!reportNumber) {
        document.getElementById('chatMessages').innerHTML = `
            <div class="chat-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>No report number provided.</p>
            </div>
        `;
        return;
    }

    currentReportNumber = reportNumber;
    document.getElementById('chatReportNumber').textContent = reportNumber;

    // Show loading state
    document.getElementById('chatMessages').innerHTML = `
        <div class="chat-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading your chat...</p>
        </div>
    `;

    // Fetch the numeric report ID
    fetchReportId(reportNumber);
});

async function fetchReportId(reportNumber) {
    try {
        console.log('🔍 Fetching report ID for:', reportNumber);

        const response = await fetch(`https://reportfraud-ftc-gov-api.onrender.com/api/reports/check/${encodeURIComponent(reportNumber)}`);
        const data = await response.json();

        console.log('📡 Response:', data);

        if (data.success && data.data) {
            // ✅ Store the numeric ID
            currentReportId = data.data.id;
            console.log('✅ Report ID set to:', currentReportId);
            document.getElementById('chatReportNumber').textContent = reportNumber;

            // Load messages
            loadUserMessages(currentReportId);

            // Start polling for new messages
            if (chatPollingInterval) {
                clearInterval(chatPollingInterval);
            }
            chatPollingInterval = setInterval(() => {
                loadUserMessages(currentReportId, true);
            }, 3000);

            // Show welcome message
            document.getElementById('chatMessages').innerHTML = `
                <div class="chat-welcome">
                    <i class="fas fa-shield-halved"></i>
                    <h4>Welcome to FTC Cyber Support</h4>
                    <p>Our team is here to help you with your fraud report.</p>
                    <p class="chat-report-number">Report #: ${reportNumber}</p>
                </div>
            `;

        } else {
            console.error('❌ Report not found:', data);
            document.getElementById('chatMessages').innerHTML = `
                <div class="chat-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Report not found. Please check your report number.</p>
                    <p style="font-size:0.8rem; margin-top:8px;">Report #: ${reportNumber}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Fetch report error:', error);
        document.getElementById('chatMessages').innerHTML = `
            <div class="chat-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Network error. Please try again.</p>
                <p style="font-size:0.8rem; margin-top:8px;">Error: ${error.message}</p>
            </div>
        `;
    }
}

async function loadUserMessages(reportId, silent = false) {
    if (!reportId) return;

    try {
        const response = await fetch(`https://reportfraud-ftc-gov-api.onrender.com/api/chat/${reportId}`);
        const data = await response.json();

        if (data.success) {
            renderUserMessages(data.data);
        }
    } catch (error) {
        if (!silent) {
            console.error('Load messages error:', error);
        }
    }
}

function renderUserMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const welcome = container.querySelector('.chat-welcome');
    if (welcome && messages && messages.length > 0) {
        welcome.style.display = 'none';
    }

    if (!messages || messages.length === 0) {
        if (welcome) {
            welcome.style.display = 'block';
        } else {
            container.innerHTML = `
                <div class="chat-empty">
                    <i class="fas fa-comment-dots"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
        }
        return;
    }

    if (welcome) {
        welcome.style.display = 'none';
    }

    const shouldScroll = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;

    const messageElements = messages.map(msg => {
        const isAdmin = msg.sender_type === 'admin';
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const senderName = msg.sender_name || (isAdmin ? 'FTC Team' : 'You');

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

    container.innerHTML = messageElements;

    if (shouldScroll || messages.length > 0) {
        container.scrollTop = container.scrollHeight;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== SEND MESSAGE =====
async function sendUserMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    // ✅ Debug logs
    console.log('🟢 Send button clicked!');
    console.log('  currentReportId:', currentReportId);
    console.log('  message:', message);

    if (!currentReportId) {
        // Try to reload the ID
        if (currentReportNumber) {
            console.log('🔄 Trying to reload report ID...');
            await fetchReportId(currentReportNumber);
            // Check again after reload
            if (!currentReportId) {
                alert('⚠️ Could not load report ID. Please refresh the page and try again.');
                return;
            }
        } else {
            alert('⚠️ Report not found. Please close this window and try again.');
            return;
        }
    }

    if (!message) {
        alert('Please enter a message.');
        return;
    }

    input.value = '';
    input.disabled = true;

    try {
        const response = await fetch('https://reportfraud-ftc-gov-api.onrender.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                report_id: currentReportId,
                message: message,
                sender_type: 'user',
                sender_name: 'User'
            })
        });

        const data = await response.json();

        if (data.success) {
            loadUserMessages(currentReportId);
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

// ===== FILE UPLOAD =====
let selectedFile = null;

document.addEventListener('DOMContentLoaded', function() {
    // File upload button handler
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');

    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            const file = this.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('File too large. Max 5MB.');
                    this.value = '';
                    return;
                }
                selectedFile = file;
                fileName.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
                filePreview.style.display = 'flex';
            }
        });
    }
});

function removeFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').style.display = 'none';
}
