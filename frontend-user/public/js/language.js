// ===== LANGUAGE SWITCHING =====
document.addEventListener('DOMContentLoaded', function() {
    const langLinks = document.querySelectorAll('[data-lang]');
    const navLangLink = document.querySelector('.main-nav a[data-key="nav_languages"]');

    // Get saved language or default to 'en'
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLang);

    // Language selection from all language links
    langLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
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
    }
});
