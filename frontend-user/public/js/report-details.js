document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("detailsForm");
    const continueBtn = document.getElementById("detailsContinueBtn");

    // Load saved data if exists
    const savedData = JSON.parse(sessionStorage.getItem("reportDetails") || "{}");
    if (savedData) {
        document.getElementById("incidentDescription").value = savedData.description || "";
        document.getElementById("incidentDate").value = savedData.date || "";
        document.getElementById("amountLost").value = savedData.amount || "";
        document.getElementById("paymentMethod").value = savedData.payment || "";
        document.getElementById("suspectName").value = savedData.suspectName || "";
        document.getElementById("suspectEmail").value = savedData.suspectEmail || "";
        document.getElementById("suspectPhone").value = savedData.suspectPhone || "";
        document.getElementById("suspectWebsite").value = savedData.suspectWebsite || "";
        document.getElementById("additionalInfo").value = savedData.additionalInfo || "";
    }

    continueBtn.addEventListener("click", function () {
        // Validate required fields
        const description = document.getElementById("incidentDescription").value.trim();
        if (!description) {
            alert("Please describe the incident.");
            document.getElementById("incidentDescription").focus();
            return;
        }

        // Save data to sessionStorage
        const data = {
            description: description,
            date: document.getElementById("incidentDate").value,
            amount: document.getElementById("amountLost").value,
            payment: document.getElementById("paymentMethod").value.trim(),
            suspectName: document.getElementById("suspectName").value.trim(),
            suspectEmail: document.getElementById("suspectEmail").value.trim(),
            suspectPhone: document.getElementById("suspectPhone").value.trim(),
            suspectWebsite: document.getElementById("suspectWebsite").value.trim(),
            additionalInfo: document.getElementById("additionalInfo").value.trim()
        };

        sessionStorage.setItem("reportDetails", JSON.stringify(data));

        // Navigate to contact page
        window.location.href = "/report-contact.html";
    });
});
