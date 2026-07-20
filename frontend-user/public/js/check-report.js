document.addEventListener("DOMContentLoaded", function () {
    const checkBtn = document.getElementById("checkReportBtn");
    const reportInput = document.getElementById("reportNumberInput");
    const resultDiv = document.getElementById("reportResult");
    const errorDiv = document.getElementById("reportError");
    const errorMessage = document.getElementById("errorMessage");
    const chatSection = document.getElementById("chatSection");
    const liveChatBtn = document.getElementById("liveChatBtn2");

    // Allow Enter key to submit
    reportInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            checkBtn.click();
        }
    });

    checkBtn.addEventListener("click", function () {
        const reportNumber = reportInput.value.trim();

        if (!reportNumber) {
            document.getElementById("reportNumberError").style.display = "block";
            return;
        } else {
            document.getElementById("reportNumberError").style.display = "none";
        }

        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        checkBtn.disabled = true;

        resultDiv.style.display = "none";
        errorDiv.style.display = "none";
        chatSection.style.display = "none";

        fetch(`https://reportfraud-ftc-gov-api.onrender.com/api/reports/check/${encodeURIComponent(reportNumber)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayReport(data.data);
                    // ✅ Show chat section
                    chatSection.style.display = "block";
                } else {
                    showError(data.message || "Report not found.");
                }
            })
            .catch(err => {
                console.error("Error:", err);
                showError("Network error. Please try again.");
            })
            .finally(() => {
                checkBtn.innerHTML = '<i class="fas fa-search"></i> Check Status';
                checkBtn.disabled = false;
            });
    });

    // ✅ Live Chat Button Handler
    if (liveChatBtn) {
        liveChatBtn.addEventListener("click", function () {
            const reportNumber = document.getElementById("resultNumber").textContent;
            // Open chat window in a new tab
            window.open(`/chat.html?report=${reportNumber}`, '_blank', 'width=500,height=700');
        });
    }

    function displayReport(report) {
        document.getElementById("resultNumber").textContent = report.report_number;
        document.getElementById("resultCategory").textContent = report.category || "N/A";
        document.getElementById("resultSubmitted").textContent = formatDate(report.submitted_at);
        document.getElementById("resultUpdated").textContent = formatDate(report.updated_at);
        document.getElementById("resultName").textContent = `${report.first_name || ""} ${report.last_name || ""}`.trim() || "N/A";
        document.getElementById("resultEmail").textContent = report.email || "N/A";
        document.getElementById("resultDescription").textContent = report.description || "N/A";

        const statusEl = document.getElementById("resultStatus");
        const status = report.status || "pending";
        statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusEl.className = `status-badge ${status}`;

        resultDiv.style.display = "block";
        errorDiv.style.display = "none";
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorDiv.style.display = "block";
        resultDiv.style.display = "none";
        chatSection.style.display = "none";
    }

    function formatDate(dateString) {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return dateString;
        }
    }
});
