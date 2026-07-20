document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("detailsForm");
    const continueBtn = document.getElementById("detailsContinueBtn");
    const imageInput = document.getElementById("suspectImage");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreview");
    const removeBtn = document.getElementById("removeImageBtn");
    const uploadStatus = document.getElementById("imageUploadStatus");

    let uploadedImageUrl = null;

    // Load saved data from sessionStorage
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
        uploadedImageUrl = savedData.suspectImageUrl || null;
        if (uploadedImageUrl) {
            previewImg.src = uploadedImageUrl;
            previewContainer.style.display = "block";
        }
    }

    // ---- Image Upload ----
    imageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            uploadStatus.textContent = "File too large. Max 5MB.";
            uploadStatus.style.color = "#d93025";
            this.value = "";
            return;
        }

        uploadStatus.textContent = "Uploading...";
        uploadStatus.style.color = "#555";

        const formData = new FormData();
        formData.append("image", file);

        fetch("https://reportfraud-ftc-gov-api.onrender.com/api/upload/image", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                uploadedImageUrl = data.data.url;
                previewImg.src = uploadedImageUrl;
                previewContainer.style.display = "block";
                uploadStatus.textContent = "✅ Image uploaded successfully.";
                uploadStatus.style.color = "#0f7b3e";
                // Save to sessionStorage immediately
                saveDetails();
            } else {
                uploadStatus.textContent = "Upload failed: " + (data.message || "Unknown error");
                uploadStatus.style.color = "#d93025";
            }
        })
        .catch(err => {
            uploadStatus.textContent = "Network error during upload.";
            uploadStatus.style.color = "#d93025";
            console.error(err);
        });
    });

    removeBtn.addEventListener("click", function () {
        uploadedImageUrl = null;
        previewImg.src = "#";
        previewContainer.style.display = "none";
        imageInput.value = "";
        uploadStatus.textContent = "Image removed.";
        uploadStatus.style.color = "#555";
        saveDetails();
    });

    // ---- Validation and Continue ----
    function validateStep() {
        let valid = true;
        const description = document.getElementById("incidentDescription").value.trim();
        const date = document.getElementById("incidentDate").value;
        const errorDesc = document.getElementById("incidentDescriptionError");
        const errorDate = document.getElementById("incidentDateError");

        // Description
        if (!description) {
            errorDesc.style.display = "block";
            valid = false;
        } else {
            errorDesc.style.display = "none";
        }

        // Date
        if (!date) {
            errorDate.style.display = "block";
            valid = false;
        } else {
            errorDate.style.display = "none";
        }

        return valid;
    }

    // Real-time validation on input blur
    document.getElementById("incidentDescription").addEventListener("blur", validateStep);
    document.getElementById("incidentDate").addEventListener("blur", validateStep);

    function saveDetails() {
        const data = {
            description: document.getElementById("incidentDescription").value.trim(),
            date: document.getElementById("incidentDate").value,
            amount: document.getElementById("amountLost").value,
            payment: document.getElementById("paymentMethod").value.trim(),
            suspectName: document.getElementById("suspectName").value.trim(),
            suspectEmail: document.getElementById("suspectEmail").value.trim(),
            suspectPhone: document.getElementById("suspectPhone").value.trim(),
            suspectWebsite: document.getElementById("suspectWebsite").value.trim(),
            additionalInfo: document.getElementById("additionalInfo").value.trim(),
            suspectImageUrl: uploadedImageUrl
        };
        sessionStorage.setItem("reportDetails", JSON.stringify(data));
    }

    continueBtn.addEventListener("click", function () {
        if (!validateStep()) {
            // Focus first invalid field
            const firstInvalid = document.querySelector(".error-message[style*='display: block']");
            if (firstInvalid) {
                const field = firstInvalid.id.replace("Error", "");
                const el = document.getElementById(field);
                if (el) el.focus();
            }
            return;
        }

        saveDetails();
        window.location.href = "/report-contact.html";
    });
});
