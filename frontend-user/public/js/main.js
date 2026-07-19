// ===== MAIN GLOBAL FUNCTIONS =====
document.addEventListener("DOMContentLoaded", function () {

    // ---- Mobile Toggle ----
    const mobileToggle = document.getElementById("mobileToggle");
    const mainNav = document.getElementById("mainNav");

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener("click", function () {
            mainNav.classList.toggle("open");
            const icon = this.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-times");
            }
        });
    }

    // ---- Language Dropdown ----
    const langToggle = document.getElementById("langToggle");
    const langMenu = document.getElementById("langMenu");

    if (langToggle && langMenu) {
        langToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            langMenu.classList.toggle("open");
        });

        document.addEventListener("click", function () {
            langMenu.classList.remove("open");
        });
    }

    // ---- FAQ Accordion ----
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(function (button) {
        button.addEventListener("click", function () {
            const item = this.closest(".faq-item");
            if (!item) return;

            const isOpen = item.classList.contains("is-open");
            item.classList.toggle("is-open", !isOpen);
            this.setAttribute("aria-expanded", !isOpen ? "true" : "false");
        });
    });

    // ---- FAQ Search ----
    const faqSearch = document.getElementById("faqSearch");
    if (faqSearch) {
        faqSearch.addEventListener("input", function () {
            const query = this.value.toLowerCase().trim();
            const items = document.querySelectorAll(".faq-item");

            items.forEach(function (item) {
                const text = item.textContent.toLowerCase();
                if (!query || text.includes(query)) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }

    // ---- "How you know" Banner Toggle ----
    const howYouKnowLink = document.getElementById("howYouKnowLink");
    if (howYouKnowLink) {
        howYouKnowLink.addEventListener("click", function (e) {
            e.preventDefault();
            const banner = this.closest(".gov-banner");
            if (banner) {
                banner.classList.toggle("expanded");
            }
        });
    }

    console.log("🚀 ReportFraud.ftc.gov UI fully loaded!");
});
