document.addEventListener("DOMContentLoaded", function () {
    syncWithExistingMobileMenu();
    initFaqAccordion();
    initFaqTopics();
    initFaqSearch();
});

function syncWithExistingMobileMenu() {
    const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
    const utilityPanel = document.querySelector('[data-mobile-utility-panel]');
    const mainNav = document.getElementById('mainNav');
    const closeTargets = document.querySelectorAll('[data-mobile-menu-close]');

    if (!menuToggle || !utilityPanel) return;

    menuToggle.addEventListener('click', function () {
        setTimeout(function () {
            const navIsOpen = mainNav && mainNav.classList.contains('open');
            utilityPanel.classList.toggle('is-open', !!navIsOpen);
            menuToggle.setAttribute('aria-expanded', navIsOpen ? 'true' : 'false');
            document.body.classList.toggle('mobile-menu-open', !!navIsOpen);
        }, 0);
    });

    closeTargets.forEach(function (item) {
        item.addEventListener('click', function () {
            utilityPanel.classList.remove('is-open');
            document.body.classList.remove('mobile-menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');

            if (mainNav && mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
            }

            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
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
                group.classList.remove('hidden-by-search');
            });

            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(function (item) {
                item.classList.remove('hidden-by-search');
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
    const searchForms = document.querySelectorAll('[data-faq-search-form]');

    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    });

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            const query = input.value.trim().toLowerCase();
            const allGroups = document.querySelectorAll('.faq-group');
            const allItems = document.querySelectorAll('.faq-item');
            const topicButtons = document.querySelectorAll('.faq-topic-btn');

            if (!query) {
                allGroups.forEach(function (group) {
                    group.classList.remove('hidden-by-search');
                });

                allItems.forEach(function (item) {
                    item.classList.remove('hidden-by-search');
                });

                const activeBtn = document.querySelector('.faq-topic-btn.is-active');
                const activeTopic = activeBtn ? activeBtn.getAttribute('data-topic') : 'all';

                allGroups.forEach(function (group) {
                    const groupTopic = group.getAttribute('data-topic-group');
                    group.classList.toggle('is-active', groupTopic === activeTopic);
                });

                return;
            }

            topicButtons.forEach(function (btn) {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            });

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
                group.classList.add('is-active');
            });
        });
    });
}
