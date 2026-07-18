// Main frontend JavaScript

document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  await loadSettings();
  
  // Load categories
  await loadCategories();
  
  // Load stats
  await loadStats();
  
  // Mobile toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
  }
});

async function loadSettings() {
  try {
    const response = await API.getSettings();
    if (response.success) {
      const settings = response.data;
      
      // Site name
      const siteNameElements = document.querySelectorAll('#siteName, #footerSiteName');
      siteNameElements.forEach(el => {
        if (el) el.textContent = settings.site_name || 'ReportFraud';
      });
      
      // Logo
      const logoElements = document.querySelectorAll('#siteLogo, #footerLogo');
      logoElements.forEach(el => {
        if (el && settings.site_logo) {
          el.src = settings.site_logo;
          el.style.display = 'inline';
        } else if (el) {
          el.style.display = 'none';
        }
      });
      
      // Footer text
      const footerTextEl = document.getElementById('footerText');
      if (footerTextEl && settings.footer_text) {
        footerTextEl.textContent = settings.footer_text;
      }
      
      // Footer email
      const footerEmailEl = document.getElementById('footerEmail');
      if (footerEmailEl && settings.admin_email) {
        footerEmailEl.textContent = `Email: ${settings.admin_email}`;
      }
      
      // Homepage heading
      const headingEl = document.getElementById('homepageHeading');
      if (headingEl && settings.homepage_heading) {
        headingEl.textContent = settings.homepage_heading;
      }
      
      // Homepage description
      const descEl = document.getElementById('homepageDescription');
      if (descEl && settings.homepage_description) {
        descEl.textContent = settings.homepage_description;
      }
      
      // Confirmation message
      const confirmEl = document.getElementById('confirmationMessage');
      if (confirmEl && settings.confirmation_message) {
        confirmEl.textContent = settings.confirmation_message;
      }
      
      // Page title
      if (settings.site_name) {
        document.title = `${settings.site_name} - Report Fraud`;
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function loadCategories() {
  try {
    const response = await API.getCategories(true);
    if (response.success && response.data) {
      const categories = response.data;
      const grid = document.getElementById('categoriesGrid');
      if (grid) {
        grid.innerHTML = categories.map(cat => `
                    <a href="/report.html?category=${cat.id}" class="category-tag">
                        ${cat.name}
                    </a>
                `).join('');
      }
      
      // Also populate the select dropdown in report form
      const select = document.getElementById('category');
      if (select) {
        select.innerHTML = '<option value="">Select a category</option>' +
          categories.map(cat => `
                        <option value="${cat.id}">${cat.name}</option>
                    `).join('');
      }
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

async function loadStats() {
  try {
    const response = await API.getStats();
    if (response.success) {
      const stats = response.stats;
      const totalEl = document.getElementById('totalReports');
      const resolvedEl = document.getElementById('resolvedReports');
      const investigatingEl = document.getElementById('investigatingReports');
      const pendingEl = document.getElementById('pendingReports');
      
      if (totalEl) totalEl.textContent = stats.total || 0;
      if (resolvedEl) resolvedEl.textContent = stats.resolved || 0;
      if (investigatingEl) investigatingEl.textContent = stats.investigating || 0;
      if (pendingEl) pendingEl.textContent = stats.pending || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    // Set default values if stats fail
    document.getElementById('totalReports').textContent = '0';
    document.getElementById('resolvedReports').textContent = '0';
    document.getElementById('investigatingReports').textContent = '0';
    document.getElementById('pendingReports').textContent = '0';
  }
}