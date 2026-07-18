// API configuration
// API_BASE should be set in Render environment variables
const API_BASE = window.API_BASE || 'https://reportfraud-ftc-gov-api.onrender.com';
// All API calls will use ${API_BASE}/api/...
// Example: ${API_BASE}/api/auth/login
// Get auth token from localStorage
const getToken = () => localStorage.getItem('adminToken');

// Helper for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getToken();
  if (!token) {
    window.location.href = '/';
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  const data = await response.json();
  
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/';
    throw new Error('Session expired');
  }
  
  return data;
};

const API = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },
  
  verify: async () => {
    return authFetch('/auth/verify');
  },
  
  logout: async () => {
    return authFetch('/auth/logout', { method: 'POST' });
  },
  
  // Reports
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authFetch(`/reports?${query}`);
  },
  
  getReportStats: async () => {
    return authFetch('/reports/stats');
  },
  
  getReport: async (id) => {
    return authFetch(`/reports/${id}`);
  },
  
  updateReportStatus: async (id, status, notes) => {
    return authFetch(`/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes: notes })
    });
  },
  
  // Categories
  getCategories: async (activeOnly = false) => {
    const url = activeOnly ? '/categories?active_only=true' : '/categories';
    return authFetch(url);
  },
  
  createCategory: async (data) => {
    return authFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  updateCategory: async (id, data) => {
    return authFetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  deleteCategory: async (id) => {
    return authFetch(`/categories/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Settings
  getSettings: async () => {
    return authFetch('/settings');
  },
  
  updateSettings: async (settings) => {
    return authFetch('/settings/bulk/update', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },
  
  // Upload
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  }
};
