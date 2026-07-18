// Admin authentication

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Check if already logged in
  const token = localStorage.getItem('adminToken');
  if (token) {
    // Verify token
    API.verify()
      .then(response => {
        if (response.success) {
          window.location.href = '/dashboard.html';
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      });
  }
});

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('loginError');
  
  if (!username || !password) {
    errorEl.textContent = 'Please enter both username and password.';
    errorEl.style.display = 'block';
    return;
  }
  
  errorEl.style.display = 'none';
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  submitBtn.disabled = true;
  
  try {
    const response = await API.login(username, password);
    
    if (response.success) {
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.admin));
      window.location.href = '/dashboard.html';
    } else {
      errorEl.textContent = response.message || 'Login failed. Please try again.';
      errorEl.style.display = 'block';
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      submitBtn.disabled = false;
    }
  } catch (error) {
    errorEl.textContent = 'Network error. Please try again.';
    errorEl.style.display = 'block';
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    submitBtn.disabled = false;
  }
}