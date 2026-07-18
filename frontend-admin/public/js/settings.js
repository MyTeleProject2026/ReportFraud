// Admin Settings

document.addEventListener('DOMContentLoaded', () => {
  // Verify admin
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/';
    return;
  }
  
  // Set admin user
  const userData = localStorage.getItem('adminUser');
  if (userData) {
    const user = JSON.parse(userData);
    document.getElementById('adminUser').innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
  }
  
  // Load settings
  loadSettings();
  
  // Setup form submission
  document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);
  
  // Setup logo upload
  document.getElementById('uploadLogoBtn').addEventListener('click', handleLogoUpload);
  
  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.querySelector('.admin-sidebar').classList.toggle('open');
  });
});

async function loadSettings() {
  try {
    const response = await API.getSettings();
    if (response.success) {
      const settings = response.data;
      document.getElementById('siteName').value = settings.site_name || '';
      document.getElementById('siteLogo').value = settings.site_logo || '';
      document.getElementById('adminEmail').value = settings.admin_email || '';
      document.getElementById('footerText').value = settings.footer_text || '';
      document.getElementById('homepageHeading').value = settings.homepage_heading || '';
      document.getElementById('homepageDescription').value = settings.homepage_description || '';
      document.getElementById('confirmationMessage').value = settings.confirmation_message || '';
      
      // Show logo preview
      if (settings.site_logo) {
        const preview = document.getElementById('uploadPreview');
        preview.innerHTML = `<img src="${settings.site_logo}" alt="Logo Preview">`;
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
    alert('Failed to load settings. Please refresh.');
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Filter out empty values
  Object.keys(data).forEach(key => {
    if (data[key] === '') delete data[key];
  });
  
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;
  
  try {
    const response = await API.updateSettings(data);
    if (response.success) {
      alert('Settings saved successfully!');
      // Reload settings to show updated values
      await loadSettings();
    } else {
      alert(response.message || 'Failed to save settings.');
    }
  } catch (error) {
    console.error('Save settings error:', error);
    alert('An error occurred while saving settings.');
  } finally {
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save All Settings';
    submitBtn.disabled = false;
  }
}

async function handleLogoUpload() {
  const fileInput = document.getElementById('logoUpload');
  const file = fileInput.files[0];
  const statusEl = document.getElementById('uploadStatus');
  
  if (!file) {
    alert('Please select a file first.');
    return;
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  
  // Validate size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size should be less than 2MB.');
    return;
  }
  
  statusEl.textContent = 'Uploading...';
  statusEl.style.color = 'var(--gray-600)';
  
  try {
    const response = await API.uploadImage(file);
    if (response.success) {
      const url = response.data.url;
      document.getElementById('siteLogo').value = url;
      document.getElementById('uploadPreview').innerHTML = `<img src="${url}" alt="Logo Preview">`;
      statusEl.textContent = '✅ Upload successful!';
      statusEl.style.color = 'var(--success)';
    } else {
      statusEl.textContent = '❌ ' + (response.message || 'Upload failed.');
      statusEl.style.color = 'var(--danger)';
    }
  } catch (error) {
    console.error('Upload error:', error);
    statusEl.textContent = '❌ Upload failed. Check console for details.';
    statusEl.style.color = 'var(--danger)';
  }
}

async function handleLogout(e) {
  e.preventDefault();
  try {
    await API.logout();
  } catch (error) {
    // Ignore
  }
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/';
}