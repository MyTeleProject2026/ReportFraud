document.addEventListener("DOMContentLoaded", function () {
    initMobileUtilityMenu();
    initFaqAccordion();
    initFaqTopics();
    initFaqSearch();
});

function initMobileUtilityMenu() {
    const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
    const utilityPanel = document.querySelector('[data-mobile-utility-panel]');
    const menuCloseTargets = document.querySelectorAll('[data-mobile-menu-close]');

    if (!menuToggle || !utilityPanel) return;

    menuToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpen = utilityPanel.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('mobile-menu-open', isOpen);
    });

    menuCloseTargets.forEach(function (item) {
        item.addEventListener('click', function () {
            utilityPanel.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('mobile-menu-open');
        });
    });
}

function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(function (button) {
        button.addEventListener('click', function () {
            const item = button.closest('.faq-item');
            if (!item) return;

            const isOpen = item.classList.contains('is-open');

            item.classList.toggle('is-open', !isOpen);
            button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        });
    });
}

function initFaqTopics() {
    const topicButtons = document.querySelectorAll('.faq-topic-btn');
    const faqGroups = document.querySelectorAll('.faq-group');

    if (!topicButtons.length || !faqGroups.length) return;

    topicButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const target = btn.getAttribute('data-topic');

            topicButtons.forEach(function (b) {
                b.classList.remove('is-active');
                b.setAttribute('aria-selected', 'false');
            });

            faqGroups.forEach(function (group) {
                group.classList.remove('is-active');
            });

            btn.classList.add('is-active');
            btn.setAttribute('aria-selected', 'true');

            const targetGroup = document.querySelector('.faq-group[data-topic-group="' + target + '"]');
            if (targetGroup) {
                targetGroup.classList.add('is-active');
            }
        });
    });
}

function initFaqSearch() {
    const searchInputs = document.querySelectorAll('[data-faq-search-input]');

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            const query = input.value.trim().toLowerCase();
            const allGroups = document.querySelectorAll('.faq-group');
            const allItems = document.querySelectorAll('.faq-item');

            if (!query) {
                allGroups.forEach(function (group) {
                    group.classList.remove('hidden-by-search');
                });

                allItems.forEach(function (item) {
                    item.classList.remove('hidden-by-search');
                });

                return;
            }

            allGroups.forEach(function (group) {
                let hasVisibleItem = false;
                const items = group.querySelectorAll('.faq-item');

                items.forEach(function (item) {
                    const questionText = item.querySelector('.faq-question-text')?.textContent.toLowerCase() || '';
                    const answerText = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';
                    const matched = questionText.includes(query) || answerText.includes(query);

                    item.classList.toggle('hidden-by-search', !matched);

                    if (matched) {
                        hasVisibleItem = true;
                    }
                });

                group.classList.toggle('hidden-by-search', !hasVisibleItem);
            });
        });
    });

    const searchForms = document.querySelectorAll('[data-faq-search-form]');
    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    });
}
