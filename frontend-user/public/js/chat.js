// ===== USER CHAT LOGIC =====
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

    document.getElementById('chatReportNumber').textContent = reportNumber;
    currentReportNumber = reportNumber;

    // ✅ STEP 1: Get the numeric report ID from the report number
    fetchReportId(reportNumber);
});

let currentReportId = null;
let currentReportNumber = null;
let chatPollingInterval = null;

async function fetchReportId(reportNumber) {
    try {
        const response = await fetch(`https://reportfraud-ftc-gov-api.onrender.com/api/reports/check/${encodeURIComponent(reportNumber)}`);
        const data = await response.json();

        if (data.success && data.data) {
            // ✅ Store the numeric ID
            currentReportId = data.data.id;
            document.getElementById('chatReportNumber').textContent = reportNumber;

            // Load messages using the numeric ID
            loadUserMessages(currentReportId);

            // Start polling
            if (chatPollingInterval) {
                clearInterval(chatPollingInterval);
            }
            chatPollingInterval = setInterval(() => {
                loadUserMessages(currentReportId, true);
            }, 3000);
        } else {
            document.getElementById('chatMessages').innerHTML = `
                <div class="chat-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Report not found. Please check your report number.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Fetch report error:', error);
        document.getElementById('chatMessages').innerHTML = `
            <div class="chat-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Network error. Please try again.</p>
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

async function sendUserMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message || !currentReportId) {
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
                report_id: currentReportId,  // ✅ Now using numeric ID
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
    // ... existing code ...

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
                // Check file size (max 5MB)
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

// ===== OVERRIDE sendUserMessage to handle files =====
// Replace your existing sendUserMessage with this:

async function sendUserMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message && !selectedFile) {
        alert('Please enter a message or attach a file.');
        return;
    }

    // If there's a file, upload it first
    if (selectedFile) {
        await uploadFile();
    }

    // Send the message
    if (message && currentReportId) {
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
                    message: message + (selectedFile ? ' 📎 File attached' : ''),
                    sender_type: 'user',
                    sender_name: 'User'
                })
            });

            const data = await response.json();

            if (data.success) {
                loadUserMessages(currentReportId);
                removeFile();
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
}

async function uploadFile() {
    if (!selectedFile || !currentReportId) return;

    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('report_id', currentReportId);

        // Use the public upload endpoint
        const response = await fetch('https://reportfraud-ftc-gov-api.onrender.com/api/public/upload/image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // File uploaded successfully - we'll add the URL to the chat
            const fileUrl = data.data.url;
            // You can send the file URL as a message
            const message = `📎 File shared: ${selectedFile.name}\n${fileUrl}`;
            
            // Send file URL as chat message
            const chatResponse = await fetch('https://reportfraud-ftc-gov-api.onrender.com/api/chat', {
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
            
            const chatData = await chatResponse.json();
            if (chatData.success) {
                loadUserMessages(currentReportId);
                removeFile();
            }
        } else {
            alert('File upload failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to upload file. Please try again.');
    }
}
