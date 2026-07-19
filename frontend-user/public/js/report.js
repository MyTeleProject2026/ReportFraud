// Report form JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Load categories into dropdown
  loadCategoriesForForm();

  // Setup form steps
  setupFormSteps();

  // Handle form submission
  const form = document.getElementById('reportForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
});

async function loadCategoriesForForm() {
  try {
    const select = document.getElementById('category');
    if (!select) return;

    if (typeof API !== 'undefined' && API.getCategories) {
      const response = await API.getCategories(true);

      if (response.success && response.data) {
        select.innerHTML =
          '<option value="">Select a category</option>' +
          response.data.map(cat => `
            <option value="${cat.id}">${cat.name}</option>
          `).join('');
        return;
      }
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

function setupFormSteps() {
  const steps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  let currentStep = 0;

  if (!steps.length) return;

  // Show first step
  showStep(0);

  // Next buttons
  document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
        }
      }
    });
  });

  // Previous buttons
  document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  function showStep(index) {
    // Hide all steps
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });

    // Update progress
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });

    // Update review summary on step 4
    if (index === 3) {
      updateReviewSummary();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(index) {
    const step = steps[index];
    if (!step) return true;

    const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#b42318';
        valid = false;
      } else {
        input.style.borderColor = '';
      }
    });

    if (!valid) {
      alert('Please fill in all required fields marked with *');
    }

    return valid;
  }
}

function updateReviewSummary() {
  const summary = document.querySelector('.review-summary');
  if (!summary) return;

  const form = document.getElementById('reportForm');
  if (!form) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const fields = [
    { label: 'First Name', value: data.first_name },
    { label: 'Last Name', value: data.last_name },
    { label: 'Email', value: data.email },
    { label: 'Phone', value: data.phone },
    { label: 'Address', value: data.address },
    { label: 'City', value: data.city },
    { label: 'State', value: data.state },
    { label: 'Zip Code', value: data.zip_code },
    { label: 'Country', value: data.country },
    { label: 'Category', value: getCategoryName(data.category_id) },
    { label: 'Incident Date', value: data.incident_date },
    { label: 'Description', value: data.incident_description },
    { label: 'Amount Lost', value: data.amount_lost ? `$${data.amount_lost}` : 'N/A' },
    { label: 'Payment Method', value: data.payment_method || 'N/A' },
    { label: 'Suspect Name', value: data.suspect_name || 'N/A' },
    { label: 'Suspect Email', value: data.suspect_email || 'N/A' },
    { label: 'Suspect Phone', value: data.suspect_phone || 'N/A' },
    { label: 'Suspect Website', value: data.suspect_website || 'N/A' },
    { label: 'Additional Info', value: data.additional_info || 'N/A' }
  ];

  summary.innerHTML = fields
    .filter(f => f.value && f.value !== 'N/A')
    .map(f => `
      <div class="review-item">
        <span class="label">${f.label}:</span>
        <span class="value">${f.value}</span>
      </div>
    `).join('');
}

function getCategoryName(categoryId) {
  const select = document.getElementById('category');
  if (!select) return 'Not selected';

  const option = select.querySelector(`option[value="${categoryId}"]`);
  return option ? option.textContent : 'Not selected';
}

async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('reportForm');
  if (!form) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate required fields
  if (!data.first_name || !data.last_name || !data.email || !data.incident_description || !data.category_id) {
    alert('Please fill in all required fields.');
    return;
  }

  // Show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : '';

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
  }

  try {
    if (typeof API !== 'undefined' && API.submitReport) {
      const response = await API.submitReport(data);

      if (response.success) {
        // Redirect to confirmation page
        const reportNumber = response.report?.report_number || 'RF-UNKNOWN';
        window.location.href = `/confirmation.html?report=${reportNumber}`;
      } else {
        alert(response.message || 'Failed to submit report. Please try again.');
      }
    } else {
      alert('API service is not available.');
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('An error occurred. Please try again later.');
  } finally {
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupCategoryChooserScreen();
});

function setupCategoryChooserScreen() {
  const chooser = document.getElementById('reportCategoryChooser');
  const continueBtn = document.getElementById('reportChooserContinue');
  const hiddenCategorySelect = document.getElementById('category');

  if (!chooser || !continueBtn || !hiddenCategorySelect) return;

  const topicInputs = chooser.querySelectorAll('input[name="report-topic-choice"]');
  const topicCards = chooser.querySelectorAll('.report-topic-card');
  const scrollHint = document.getElementById('reportScrollHint');
  const reportContainer = document.querySelector('.report-section');

  let selectedValue = '';

  topicInputs.forEach((input) => {
    input.addEventListener('change', () => {
      selectedValue = input.value;

      topicCards.forEach((card) => {
        const radio = card.querySelector('input[name="report-topic-choice"]');
        card.classList.toggle('is-selected', radio && radio.checked);
      });

      continueBtn.disabled = !selectedValue;
    });
  });

  continueBtn.addEventListener('click', () => {
    if (!selectedValue) return;

    hiddenCategorySelect.value = selectedValue;
    hiddenCategorySelect.dispatchEvent(new Event('change', { bubbles: true }));

    chooser.classList.add('report-chooser-hidden');

    if (reportContainer) {
      reportContainer.classList.remove('report-chooser-hidden');
    }

    if (scrollHint) {
      scrollHint.classList.add('is-hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function updateScrollHint() {
    if (!scrollHint || chooser.classList.contains('report-chooser-hidden')) return;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 110;
    scrollHint.classList.toggle('is-hidden', nearBottom);
  }

  updateScrollHint();
  window.addEventListener('scroll', updateScrollHint, { passive: true });
  window.addEventListener('resize', updateScrollHint);
}
