// ===== MAIN INTERACTIONS =====
document.addEventListener('DOMContentLoaded', function() {

    // ---- Mobile Toggle ----
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // ---- Close mobile menu on link click ----
    const navLinks = mainNav ? mainNav.querySelectorAll('a') : [];
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                const icon = mobileToggle?.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    });

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ---- Simple console message (optional) ----
    console.log('🚀 ReportFraud.ftc.gov Clone loaded successfully!');
});
