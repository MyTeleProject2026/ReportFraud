const { v4: uuidv4 } = require('uuid');

const generateReportNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RF-${year}${month}${day}-${random}`;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getStatusColor = (status) => {
  const colors = {
    'pending': '#f39c12',
    'reviewing': '#3498db',
    'investigating': '#e67e22',
    'resolved': '#27ae60',
    'rejected': '#e74c3c'
  };
  return colors[status] || '#95a5a6';
};

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pending',
    'reviewing': 'Reviewing',
    'investigating': 'Investigating',
    'resolved': 'Resolved',
    'rejected': 'Rejected'
  };
  return labels[status] || status;
};

module.exports = {
  generateReportNumber,
  validateEmail,
  sanitizeInput,
  formatDate,
  getStatusColor,
  getStatusLabel
};