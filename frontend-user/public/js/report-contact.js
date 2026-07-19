document.addEventListener("DOMContentLoaded", function () {
    const contactBtn = document.getElementById("contactContinueBtn");
    const form = document.getElementById("contactForm");

    // Load saved data if exists
    const savedData = JSON.parse(sessionStorage.getItem("reportContact") || "{}");
    if (savedData) {
        document.getElementById("firstName").value = savedData.firstName || "";
        document.getElementById("lastName").value = savedData.lastName || "";
        document.getElementById("email").value = savedData.email || "";
        document.getElementById("phone").value = savedData.phone || "";
        document.getElementById("address").value = savedData.address || "";
        document.getElementById("city").value = savedData.city || "";
        document.getElementById("state").value = savedData.state || "";
        document.getElementById("zipCode").value = savedData.zipCode || "";
    }

    contactBtn.addEventListener("click", function () {
        // Save data to sessionStorage
        const data = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            state: document.getElementById("state").value.trim(),
            zipCode: document.getElementById("zipCode").value.trim()
        };

        sessionStorage.setItem("reportContact", JSON.stringify(data));

        // Navigate to review page
        window.location.href = "/report-review.html";
    });
});
