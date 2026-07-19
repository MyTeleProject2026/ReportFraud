const API_BASE = 'https://reportfraud-ftc-gov-api.onrender.com';

const API = {
  getSettings: async () => {
    const response = await fetch(`${API_BASE}/settings`);
    return response.json();
  },

  getCategories: async (activeOnly = true) => {
    const url = activeOnly
      ? `${API_BASE}/categories?active_only=true`
      : `${API_BASE}/categories`;

    const response = await fetch(url);
    return response.json();
  },

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

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/stats`);
      return response.json();
    } catch (e) {
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
