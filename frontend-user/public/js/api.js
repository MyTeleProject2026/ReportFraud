// API configuration
// API_BASE should be set in Render environment variables
const API_BASE = window.API_BASE || 'https://reportfraud-ftc-gov-api.onrender.com';

// All API calls will use ${API_BASE}/api/...
// Example: ${API_BASE}/api/auth/login
  // Settings
  getSettings: async () => {
    const response = await fetch(`${API_BASE}/settings`);
    return response.json();
  },
  
  // Categories
  getCategories: async (activeOnly = true) => {
    const url = activeOnly ? `${API_BASE}/categories?active_only=true` : `${API_BASE}/categories`;
    const response = await fetch(url);
    return response.json();
  },
  
  // Reports
  submitReport: async (data) => {
    const response = await fetch(`${API_BASE}/reports/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  // Stats (public)
  getStats: async () => {
    // For public stats, we'll use a simplified endpoint or aggregate from categories
    // For now, we'll fetch from the admin stats endpoint (if accessible)
    try {
      const response = await fetch(`${API_BASE}/reports/stats`);
      return response.json();
    } catch (e) {
      // If stats endpoint requires auth, return mock data
      return {
        success: true,
        stats: {
          total: 0,
          pending: 0,
          reviewing: 0,
          investigating: 0,
          resolved: 0,
          rejected: 0
        }
      };
    }
  }
};
