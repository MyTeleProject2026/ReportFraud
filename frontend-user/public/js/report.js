document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wizardForm');
  if (!form) return;

  const steps = Array.from(document.querySelectorAll('.vt-step-panel'));
  const indicators = Array.from(document.querySelectorAll('.vt-step-indicator'));
  const progressFill = document.getElementById('progressFill');

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const scrollBanner = document.getElementById('scrollBanner');

  const govExpandBtn = document.getElementById('govExpandBtn');
  const govExpandPanel = document.getElementById('govExpandPanel');

  const guardrailModal = document.getElementById('guardrailModal');
  const guardrailStay = document.getElementById('guardrailStay');

  const sessionModal = document.getElementById('sessionModal');
  const sessionContinue = document.getElementById('sessionContinue');
  const sessionReset = document.getElementById('sessionReset');

  const categoryHidden = document.getElementById('category_id');

  let currentStep = 0;
  let warningTimer = null;
  let expireTimer = null;

  const SESSION_WARNING_MS = 12 * 60 * 1000;
  const SESSION_EXPIRE_MS = 15 * 60 * 1000;

  setupCategoryCards();
  setupGovBanner();
  setupNavigation();
  resetSessionTimers();
  showStep(0);
  updateScrollBanner();

  window.addEventListener('scroll', updateScrollBanner, { passive: true });
  window.addEventListener('resize', updateScrollBanner);

  form.addEventListener('input', resetSessionTimers);
  form.addEventListener('change', resetSessionTimers);
  document.addEventListener('click', resetSessionTimers);
  document.addEventListener('keydown', resetSessionTimers);

  function setupGovBanner() {
    if (!govExpandBtn || !govExpandPanel) return;
    govExpandBtn.addEventListener('click', () => {
      const expanded = govExpandBtn.getAttribute('aria-expanded') === 'true';
      govExpandBtn.setAttribute('aria-expanded', String(!expanded));
      govExpandPanel.hidden = expanded;
    });
  }

  function setupCategoryCards() {
    const cards = document.querySelectorAll('.vt-category-card');
    const radios = form.querySelectorAll('input[name="report_topic"]');

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        cards.forEach(card => {
          const input = card.querySelector('input[name="report_topic"]');
          card.classList.toggle('is-selected', !!input?.checked);
        });
        categoryHidden.value = mapCategoryId(radio.value);
      });
    });
  }

  function setupNavigation() {
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === 0) {
          const selected = form.querySelector('input[name="report_topic"]:checked');
          if (selected && selected.value === 'credit') {
            openModal(guardrailModal);
            return;
          }
        }

        if (currentStep < steps.length - 1) {
          currentStep++;
          if (currentStep === 3) renderReview();
          showStep(currentStep);
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmit);
    }

    if (guardrailStay) {
      guardrailStay.addEventListener('click', () => {
        closeModal(guardrailModal);
        if (currentStep < steps.length - 1) {
          currentStep++;
          if (currentStep === 3) renderReview();
          showStep(currentStep);
        }
      });
    }

    if (sessionContinue) {
      sessionContinue.addEventListener('click', () => {
        closeModal(sessionModal);
        resetSessionTimers();
      });
    }

    if (sessionReset) {
      sessionReset.addEventListener('click', () => {
        form.reset();
        document.querySelectorAll('.vt-category-card').forEach(card => card.classList.remove('is-selected'));
        categoryHidden.value = '';
        closeModal(sessionModal);
        currentStep = 0;
        showStep(0);
        resetSessionTimers();
      });
    }
  }

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
      indicator.classList.toggle('done', i < index);
    });

    const percent = ((index + 1) / steps.length) * 100;
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (backBtn) backBtn.classList.toggle('vt-hidden', index === 0);
    if (nextBtn) nextBtn.classList.toggle('vt-hidden', index === steps.length - 1);
    if (submitBtn) submitBtn.classList.toggle('vt-hidden', index !== steps.length - 1);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(stepIndex) {
    clearStepErrors(stepIndex);

    if (stepIndex === 0) {
      const selected = form.querySelector('input[name="report_topic"]:checked');
      if (!selected) {
        alert('Please select a category before continuing.');
        return false;
      }
      return true;
    }

    if (stepIndex === 1) {
      return validateRequiredFields(['incident_description']);
    }

    return true;
  }

  function validateRequiredFields(names) {
    let valid = true;

    names.forEach(name => {
      const field = form.querySelector(`[name="${name}"]`);
      if (!field) return;
      if (!field.value.trim()) {
        field.classList.add('vt-invalid');
        valid = false;
      }
    });

    if (!valid) {
      alert('Please fill in the required fields before continuing.');
    }

    return valid;
  }

  function clearStepErrors(stepIndex) {
    const step = steps[stepIndex];
    if (!step) return;
    step.querySelectorAll('.vt-invalid').forEach(el => el.classList.remove('vt-invalid'));
  }

  function renderReview() {
    const data = Object.fromEntries(new FormData(form).entries());

    renderReviewList('reviewCategory', [
      ['Selected category', getCategoryLabel(data.report_topic)]
    ]);

    renderReviewList('reviewDetails', [
      ['What happened', data.incident_description],
      ['When it happened', data.incident_date],
      ['Amount lost', data.amount_lost ? `$${data.amount_lost}` : ''],
      ['Payment method', data.payment_method],
      ['Name used', data.suspect_name],
      ['Phone', data.suspect_phone],
      ['Email', data.suspect_email],
      ['Website', data.suspect_website],
      ['Additional information', data.additional_info]
    ]);

    renderReviewList('reviewContact', [
      ['First name', data.first_name],
      ['Last name', data.last_name],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Address', data.address],
      ['City', data.city],
      ['State / Province', data.state],
      ['ZIP / Postal code', data.zip_code],
      ['Country', data.country]
    ]);
  }

  function renderReviewList(id, rows) {
    const container = document.getElementById(id);
    if (!container) return;

    const filtered = rows.filter(([, value]) => value && String(value).trim());

    if (!filtered.length) {
      container.innerHTML = `<div class="vt-review-item"><div class="vt-review-label">Info</div><div class="vt-review-value">No information provided</div></div>`;
      return;
    }

    container.innerHTML = filtered.map(([label, value]) => `
      <div class="vt-review-item">
        <div class="vt-review-label">${escapeHtml(label)}</div>
        <div class="vt-review-value">${escapeHtml(String(value))}</div>
      </div>
    `).join('');
  }

  async function handleSubmit() {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const data = Object.fromEntries(new FormData(form).entries());

    const payload = {
      category_id: data.category_id || mapCategoryId(data.report_topic),
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip_code: data.zip_code || '',
      country: data.country || '',
      incident_description: data.incident_description || '',
      incident_date: data.incident_date || '',
      amount_lost: data.amount_lost || '',
      payment_method: data.payment_method || '',
      suspect_name: data.suspect_name || '',
      suspect_email: data.suspect_email || '',
      suspect_phone: data.suspect_phone || '',
      suspect_website: data.suspect_website || '',
      additional_info: data.additional_info || ''
    };

    try {
      if (typeof API !== 'undefined' && typeof API.submitReport === 'function') {
        const response = await API.submitReport(payload);

        if (response && response.success) {
          const reportNumber = response.report?.report_number || `RV-${Date.now()}`;
          const topic = encodeURIComponent(data.report_topic || '');
          window.location.href = `/confirmation.html?report=${encodeURIComponent(reportNumber)}&topic=${topic}`;
          return;
        }
      }

      const fallbackNumber = `RV-${Date.now()}`;
      const topic = encodeURIComponent(data.report_topic || '');
      window.location.href = `/confirmation.html?report=${encodeURIComponent(fallbackNumber)}&topic=${topic}`;
    } catch (error) {
      console.error(error);
      alert('An error occurred while submitting your report. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit report';
    }
  }

  function getCategoryLabel(value) {
    const map = {
      'impersonator': 'An impersonator',
      'shopping': 'Online shopping',
      'job-investment': 'Job or investment opportunity',
      'sweepstakes': 'Prize, lottery, or sweepstakes',
      'phone-service': 'Phone, internet, or TV service',
      'auto': 'Auto sale or repair',
      'health': 'Health-related issue',
      'credit': 'Credit, debt, or loan',
      'annoying-call': 'Just an unwanted call',
      'something-else': 'Something else'
    };
    return map[value] || value || 'Not selected';
  }

  function mapCategoryId(value) {
    const map = {
      'impersonator': '1',
      'shopping': '2',
      'job-investment': '3',
      'sweepstakes': '4',
      'phone-service': '5',
      'auto': '6',
      'health': '7',
      'credit': '8',
      'annoying-call': '9',
      'something-else': '10'
    };
    return map[value] || '10';
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('vt-hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('vt-hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function updateScrollBanner() {
    if (!scrollBanner) return;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 110;
    scrollBanner.classList.toggle('is-hidden', nearBottom);
  }

  function resetSessionTimers() {
    clearTimeout(warningTimer);
    clearTimeout(expireTimer);

    warningTimer = setTimeout(() => {
      openModal(sessionModal);
    }, SESSION_WARNING_MS);

    expireTimer = setTimeout(() => {
      form.reset();
      document.querySelectorAll('.vt-category-card').forEach(card => card.classList.remove('is-selected'));
      categoryHidden.value = '';
      closeModal(sessionModal);
      currentStep = 0;
      showStep(0);
      alert('Your session expired and the form was reset.');
    }, SESSION_EXPIRE_MS);
  }

  function escapeHtml(str) {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
});
