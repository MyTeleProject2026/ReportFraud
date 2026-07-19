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

    // ---- FAQ Accordion Toggle ----
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

    // ---- FAQ Topic Filters ----
    const topicButtons = document.querySelectorAll(".faq-topic-btn");
    const faqGroups = document.querySelectorAll(".faq-group");

    topicButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const target = this.getAttribute("data-topic");

            topicButtons.forEach(function (b) {
                b.classList.remove("is-active");
                b.setAttribute("aria-selected", "false");
            });
            this.classList.add("is-active");
            this.setAttribute("aria-selected", "true");

            faqGroups.forEach(function (group) {
                const groupTopic = group.getAttribute("data-topic-group");
                group.classList.toggle("is-active", groupTopic === target);
                if (target === "all") {
                    group.classList.add("is-active");
                }
            });

            if (target === "all") {
                faqGroups.forEach(function (group) {
                    group.classList.add("is-active");
                });
            }

            const searchInput = document.getElementById("faqSearchInput");
            if (searchInput) {
                searchInput.value = "";
                document.querySelectorAll(".faq-item").forEach(function (item) {
                    item.classList.remove("hidden-by-search");
                });
            }
        });
    });

    // ---- FAQ Search ----
    const searchInput = document.getElementById("faqSearchInput");
    const searchBtn = document.getElementById("faqSearchBtn");

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const allItems = document.querySelectorAll(".faq-item");
        const allGroups = document.querySelectorAll(".faq-group");

        if (!query) {
            allItems.forEach(function (item) {
                item.classList.remove("hidden-by-search");
            });
            const activeBtn = document.querySelector(".faq-topic-btn.is-active");
            if (activeBtn) {
                const topic = activeBtn.getAttribute("data-topic");
                allGroups.forEach(function (group) {
                    const groupTopic = group.getAttribute("data-topic-group");
                    group.classList.toggle("is-active", topic === "all" || groupTopic === topic);
                });
            }
            return;
        }

        allGroups.forEach(function (group) {
            group.classList.add("is-active");
        });

        allItems.forEach(function (item) {
            const question = item.querySelector(".faq-question-text")?.textContent?.toLowerCase() || "";
            const answer = item.querySelector(".faq-answer")?.textContent?.toLowerCase() || "";
            const match = question.includes(query) || answer.includes(query);
            item.classList.toggle("hidden-by-search", !match);
        });

        topicButtons.forEach(function (btn) {
            btn.classList.remove("is-active");
            btn.setAttribute("aria-selected", "false");
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", performSearch);
        searchInput.addEventListener("search", performSearch);
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
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
