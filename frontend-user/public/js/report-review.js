document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");

    // Get all data from sessionStorage
    const category = sessionStorage.getItem("reportCategory") || "Not specified";
    const details = JSON.parse(sessionStorage.getItem("reportDetails") || "{}");
    const contact = JSON.parse(sessionStorage.getItem("reportContact") || "{}");

    // Populate review fields
    document.getElementById("reviewCategory").textContent = formatCategory(category);

    document.getElementById("reviewDescription").textContent = details.description || "—";
    document.getElementById("reviewDate").textContent = details.date || "—";
    document.getElementById("reviewAmount").textContent = details.amount ? "$" + details.amount : "—";
    document.getElementById("reviewPayment").textContent = details.payment || "—";

    document.getElementById("reviewSuspectName").textContent = details.suspectName || "—";
    document.getElementById("reviewSuspectEmail").textContent = details.suspectEmail || "—";
    document.getElementById("reviewSuspectPhone").textContent = details.suspectPhone || "—";
    document.getElementById("reviewSuspectWebsite").textContent = details.suspectWebsite || "—";

    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—";
    document.getElementById("reviewContactName").textContent = fullName;
    document.getElementById("reviewContactEmail").textContent = contact.email || "—";
    document.getElementById("reviewContactPhone").textContent = contact.phone || "—";
    document.getElementById("reviewContactAddress").textContent = [
        contact.address,
        contact.city,
        contact.state,
        contact.zipCode
    ].filter(Boolean).join(", ") || "—";

    // Handle submit
    submitBtn.addEventListener("click", function () {
        if (!confirm("Are you sure you want to submit this report?")) {
            return;
        }

        // Prepare data for API submission
        const reportData = {
            category: category,
            ...details,
            ...contact
        };

        // Use API to submit
        submitReport(reportData);
    });

    function formatCategory(cat) {
        const map = {
            "impersonator": "Impersonator",
            "shopping": "Online Shopping",
            "job-investment": "Job/Investment",
            "sweepstakes": "Sweepstakes/Prize",
            "phone-service": "Phone/Internet/TV",
            "credit-debt": "Credit/Debt/Loan",
            "something-else": "Something Else"
        };
        return map[cat] || cat;
    }

    async function submitReport(data) {
        const submitBtn = document.getElementById("submitBtn");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            // Construct the report object for your backend
            const report = {
                category_id: data.category,
                first_name: data.firstName || "",
                last_name: data.lastName || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                city: data.city || "",
                state: data.state || "",
                zip_code: data.zipCode || "",
                incident_date: data.date || null,
                incident_description: data.description,
                amount_lost: data.amount || null,
                payment_method: data.payment || "",
                suspect_name: data.suspectName || "",
                suspect_email: data.suspectEmail || "",
                suspect_phone: data.suspectPhone || "",
                suspect_website: data.suspectWebsite || "",
                additional_info: data.additionalInfo || ""
            };

            // Call your backend API
            const response = await fetch("https://reportfraud-ftc-gov-api.onrender.com/api/reports/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(report)
            });

            const result = await response.json();

            if (result.success) {
                // Clear session data
                sessionStorage.removeItem("reportCategory");
                sessionStorage.removeItem("reportDetails");
                sessionStorage.removeItem("reportContact");

                // Redirect to confirmation with report number
                const reportNumber = result.report?.report_number || "RF-UNKNOWN";
                window.location.href = "/confirmation.html?report=" + encodeURIComponent(reportNumber);
            } else {
                alert(result.message || "Failed to submit report. Please try again.");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("An error occurred while submitting. Please try again later.");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
});
