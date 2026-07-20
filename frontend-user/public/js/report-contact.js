document.addEventListener("DOMContentLoaded", function () {
    const contactBtn = document.getElementById("contactContinueBtn");
    const form = document.getElementById("contactForm");

    // ----- DOM elements -----
    const citizenshipSelect = document.getElementById("citizenship");
    const documentFields = document.getElementById("documentFields");
    const usaCitizenFields = document.getElementById("usaCitizenFields");
    const foreignerFields = document.getElementById("foreignerFields");
    const driverLicenseFields = document.getElementById("driverLicenseFields");

    const usCitizenshipId = document.getElementById("usCitizenshipId");
    const passportNumber = document.getElementById("passportNumber");
    const driverLicense = document.getElementById("driverLicense");

    // ----- Load saved data -----
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
        citizenshipSelect.value = savedData.citizenship || "";
        // Document fields
        usCitizenshipId.value = savedData.documentNumber || "";
        passportNumber.value = savedData.documentNumber || "";
        driverLicense.value = savedData.documentNumber || "";
        // Show/hide based on saved citizenship
        if (savedData.citizenship) {
            toggleDocumentFields(savedData.citizenship);
        }
    }

    // ----- Toggle document fields based on citizenship -----
    function toggleDocumentFields(citizenship) {
        if (citizenship === "USA Citizen") {
            documentFields.style.display = "block";
            usaCitizenFields.style.display = "block";
            foreignerFields.style.display = "none";
            driverLicenseFields.style.display = "none";
            // Clear foreigner fields
            passportNumber.value = "";
            driverLicense.value = "";
            // Make USA ID required
            usCitizenshipId.required = true;
            passportNumber.required = false;
            driverLicense.required = false;
        } else if (citizenship === "Foreigner (Student/Worker/Resident)") {
            documentFields.style.display = "block";
            usaCitizenFields.style.display = "none";
            foreignerFields.style.display = "block";
            driverLicenseFields.style.display = "block";
            // Both passport and driver license are required
            usCitizenshipId.value = "";
            usCitizenshipId.required = false;
            passportNumber.required = true;
            driverLicense.required = true;
        } else {
            documentFields.style.display = "none";
            usaCitizenFields.style.display = "none";
            foreignerFields.style.display = "none";
            driverLicenseFields.style.display = "none";
            usCitizenshipId.required = false;
            passportNumber.required = false;
            driverLicense.required = false;
        }
    }

    citizenshipSelect.addEventListener("change", function () {
        toggleDocumentFields(this.value);
        // Clear validation errors when switching
        document.querySelectorAll(".error-message").forEach(el => el.style.display = "none");
    });

    // ----- Validation function -----
    function validateStep() {
        let valid = true;
        const fields = [
            "firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode", "citizenship"
        ];
        fields.forEach(id => {
            const el = document.getElementById(id);
            const error = document.getElementById(id + "Error");
            if (!el || !error) return;
            if (!el.value.trim()) {
                error.style.display = "block";
                valid = false;
            } else {
                error.style.display = "none";
            }
        });

        // Validate email format
        const email = document.getElementById("email").value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById("emailError").textContent = "Please enter a valid email address.";
            document.getElementById("emailError").style.display = "block";
            valid = false;
        }

        // Validate document fields based on citizenship
        const citizenship = citizenshipSelect.value;
        if (citizenship === "USA Citizen") {
            const doc = usCitizenshipId.value.trim();
            if (!doc) {
                document.getElementById("usCitizenshipIdError").style.display = "block";
                valid = false;
            } else {
                document.getElementById("usCitizenshipIdError").style.display = "none";
            }
        } else if (citizenship === "Foreigner (Student/Worker/Resident)") {
            const passport = passportNumber.value.trim();
            const license = driverLicense.value.trim();
            if (!passport) {
                document.getElementById("passportNumberError").style.display = "block";
                valid = false;
            } else {
                document.getElementById("passportNumberError").style.display = "none";
            }
            if (!license) {
                document.getElementById("driverLicenseError").style.display = "block";
                valid = false;
            } else {
                document.getElementById("driverLicenseError").style.display = "none";
            }
        }

        return valid;
    }

    // Real-time validation on blur
    document.querySelectorAll("#contactForm input, #contactForm select").forEach(el => {
        el.addEventListener("blur", validateStep);
    });

    // Save data to sessionStorage
    function saveContact() {
        const citizenship = citizenshipSelect.value;
        let documentNumber = "";
        if (citizenship === "USA Citizen") {
            documentNumber = usCitizenshipId.value.trim();
        } else if (citizenship === "Foreigner (Student/Worker/Resident)") {
            documentNumber = passportNumber.value.trim() + " | " + driverLicense.value.trim();
        }

        const data = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            state: document.getElementById("state").value.trim(),
            zipCode: document.getElementById("zipCode").value.trim(),
            citizenship: citizenship,
            documentNumber: documentNumber
        };
        sessionStorage.setItem("reportContact", JSON.stringify(data));
    }

    // Continue button
    contactBtn.addEventListener("click", function () {
        if (!validateStep()) {
            const firstError = document.querySelector(".error-message[style*='display: block']");
            if (firstError) {
                const fieldId = firstError.id.replace("Error", "");
                const el = document.getElementById(fieldId);
                if (el) el.focus();
            }
            return;
        }
        saveContact();
        window.location.href = "/report-review.html";
    });
});
