document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("categoryForm");
    const continueBtn = document.getElementById("continueBtn");
    const modal = document.getElementById("redirectModal");
    const modalCancel = document.getElementById("modalCancel");
    const modalConfirm = document.getElementById("modalConfirm");

    // Track selected category
    let selectedCategory = null;
    let redirectCategory = false;

    // Handle category selection
    const cards = document.querySelectorAll(".report-option-card");
    const radios = form.querySelectorAll('input[name="category"]');

    cards.forEach(function (card) {
        card.addEventListener("click", function (e) {
            // Find the radio input inside this card
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                // Trigger change event
                const event = new Event("change", { bubbles: true });
                radio.dispatchEvent(event);
            }
        });
    });

    radios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            // Remove selected state from all cards
            cards.forEach(function (c) {
                c.classList.remove("is-selected");
            });

            // Add selected state to parent card
            const parent = this.closest(".report-option-card");
            if (parent) {
                parent.classList.add("is-selected");
            }

            selectedCategory = this.value;

            // Check if this category requires redirect
            const card = this.closest("[data-redirect]");
            if (card && card.dataset.redirect === "cfpb") {
                redirectCategory = true;
            } else {
                redirectCategory = false;
            }

            continueBtn.disabled = false;
        });
    });

    // Handle continue
    continueBtn.addEventListener("click", function () {
        if (!selectedCategory) return;

        if (redirectCategory) {
            // Show the redirect modal
            modal.style.display = "flex";
        } else {
            // Save category and proceed to details
            sessionStorage.setItem("reportCategory", selectedCategory);
            window.location.href = "/report-details.html";
        }
    });

    // Modal actions
    modalCancel.addEventListener("click", function () {
        modal.style.display = "none";
        // Uncheck the selected radio
        const selectedRadio = document.querySelector('input[name="category"]:checked');
        if (selectedRadio) {
            selectedRadio.checked = false;
            const parent = selectedRadio.closest(".report-option-card");
            if (parent) {
                parent.classList.remove("is-selected");
            }
            selectedCategory = null;
            redirectCategory = false;
            continueBtn.disabled = true;
        }
    });

    modalConfirm.addEventListener("click", function () {
        // User confirmed they want to go to CFPB
        window.open("https://www.consumerfinance.gov/complaint/", "_blank");
        modal.style.display = "none";
        // Reset form
        const selectedRadio = document.querySelector('input[name="category"]:checked');
        if (selectedRadio) {
            selectedRadio.checked = false;
            const parent = selectedRadio.closest(".report-option-card");
            if (parent) {
                parent.classList.remove("is-selected");
            }
            selectedCategory = null;
            redirectCategory = false;
            continueBtn.disabled = true;
        }
    });

    // Close modal on overlay click
    modal.addEventListener("click", function (e) {
        if (e.target === this) {
            modal.style.display = "none";
        }
    });
});
