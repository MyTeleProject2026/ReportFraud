// ===== LANGUAGE SWITCHING =====
document.addEventListener('DOMContentLoaded', function() {
    const langToggle = document.getElementById('langToggle');
    const langMenu = document.getElementById('langMenu');
    const langOptions = document.querySelectorAll('.lang-option');
    const langLinks = document.querySelectorAll('.footer-lang-list a');

    // Get saved language or default to 'en'
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLang);

    // Toggle language menu
    if (langToggle) {
        langToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            langMenu.classList.toggle('open');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function() {
        if (langMenu) {
            langMenu.classList.remove('open');
        }
    });

    // Language selection from header dropdown
    langOptions.forEach(function(option) {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            langMenu.classList.remove('open');
            // Update active state
            langOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Language selection from footer links
    langLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            // Update header active state if matching
            langOptions.forEach(function(opt) {
                opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
            });
        });
    });

    function setLanguage(lang) {
        // Save preference
        localStorage.setItem('preferredLanguage', lang);

        // Get translations
        const t = translations[lang] || translations['en'];

        // Update all elements with data-key attribute
        document.querySelectorAll('[data-key]').forEach(function(el) {
            const key = el.getAttribute('data-key');
            if (t[key] !== undefined) {
                el.textContent = t[key];
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update active state in header
        langOptions.forEach(function(opt) {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });
    }
});
