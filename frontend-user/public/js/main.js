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

    // ============================================
    // FAQ SYSTEM - 100% MATCH OFFICIAL
    // ============================================

    // ---- FAQ Accordion Toggle ----
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(function (button) {
        button.addEventListener("click", function () {
            const item = this.closest(".faq-item");
            if (!item) return;

            const isOpen = item.classList.contains("is-open");
            // Close all other items in the same accordion (optional)
            // Uncomment the next lines if you want only one open at a time
            // const accordion = item.closest('.faq-accordion');
            // if (accordion) {
            //     accordion.querySelectorAll('.faq-item.is-open').forEach(function(openItem) {
            //         if (openItem !== item) {
            //             openItem.classList.remove('is-open');
            //             openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            //         }
            //     });
            // }

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

            // Update active button
            topicButtons.forEach(function (b) {
                b.classList.remove("is-active");
                b.setAttribute("aria-selected", "false");
            });
            this.classList.add("is-active");
            this.setAttribute("aria-selected", "true");

            // Show only the selected group
            faqGroups.forEach(function (group) {
                const groupTopic = group.getAttribute("data-topic-group");
                group.classList.toggle("is-active", groupTopic === target);

                // If "all", show everything (but we handle this via data-topic-group)
                if (target === "all") {
                    group.classList.add("is-active");
                }
            });

            // If "all" is selected, show all groups
            if (target === "all") {
                faqGroups.forEach(function (group) {
                    group.classList.add("is-active");
                });
            }

            // Clear search input when switching topics
            const searchInput = document.getElementById("faqSearchInput");
            if (searchInput) {
                searchInput.value = "";
                // Remove hidden-by-search from all items
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

        // If search is empty, show all items and reset topic filter
        if (!query) {
            allItems.forEach(function (item) {
                item.classList.remove("hidden-by-search");
            });
            // Restore topic filter state
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

        // Show all groups for search results
        allGroups.forEach(function (group) {
            group.classList.add("is-active");
        });

        // Filter items
        allItems.forEach(function (item) {
            const question = item.querySelector(".faq-question-text")?.textContent?.toLowerCase() || "";
            const answer = item.querySelector(".faq-answer")?.textContent?.toLowerCase() || "";
            const match = question.includes(query) || answer.includes(query);
            item.classList.toggle("hidden-by-search", !match);
        });

        // Remove active topic highlighting (since search overrides)
        topicButtons.forEach(function (btn) {
            btn.classList.remove("is-active");
            btn.setAttribute("aria-selected", "false");
        });
        // Optionally, we could set a "search" mode indicator, but we'll just keep the visual.
    }

    if (searchInput) {
        searchInput.addEventListener("input", performSearch);
        searchInput.addEventListener("search", performSearch); // for clear button on some browsers
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
