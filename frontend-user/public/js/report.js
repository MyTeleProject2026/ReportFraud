document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reportOptionsForm");
    const continueBtn = document.getElementById("reportContinueBtn");
    const scrollBanner = document.getElementById("reportScrollBanner");

    if (!form || !continueBtn) return;

    const radios = form.querySelectorAll('input[name="report-topic"]');
    const cards = form.querySelectorAll('.report-option-card');

    radios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            continueBtn.disabled = false;

            cards.forEach(function (card) {
                const input = card.querySelector('input[name="report-topic"]');
                if (input && input.checked) {
                    card.classList.add("is-selected");
                } else {
                    card.classList.remove("is-selected");
                }
            });
        });
    });

    continueBtn.addEventListener("click", function () {
        const selected = form.querySelector('input[name="report-topic"]:checked');
        if (!selected) return;

        window.location.href = "/confirmation.html?topic=" + encodeURIComponent(selected.value);
    });

    function updateScrollBanner() {
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 110;

        if (scrollBanner) {
            scrollBanner.classList.toggle("is-hidden", nearBottom);
        }
    }

    updateScrollBanner();
    window.addEventListener("scroll", updateScrollBanner, { passive: true });
    window.addEventListener("resize", updateScrollBanner);
});
