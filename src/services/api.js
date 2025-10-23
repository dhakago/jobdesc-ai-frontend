import axios from 'axios';

// 🔧 Deteksi otomatis environment
const isDev = import.meta.env.MODE === 'development';

// ✅ Gunakan base URL sesuai environment
const API_BASE_URL = isDev
  ? 'http://localhost:3000' // untuk local development
  : import.meta.env.VITE_API_URL; // untuk production (Vercel)

// console.log('[API BASE URL]:', API_BASE_URL); // debug only

// ✅ Axios instance (dengan prefix /api)
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach session header for mutating requests so backend auth middleware passes
const SESSION_SECRET = import.meta.env.VITE_SESSION_SECRET;

api.interceptors.request.use((config) => {
  const method = (config.method || '').toLowerCase();
  const isReadOnly = method === '' || method === 'get' || method === 'head' || method === 'options';

  if (!isReadOnly && SESSION_SECRET) {
    if (typeof config.headers?.set === 'function') {
      config.headers.set('x-session-secret', SESSION_SECRET);
    } else {
      config.headers = {
        ...config.headers,
        'x-session-secret': SESSION_SECRET,
      };
    }
  }

  return config;
});

export const apiService = {
  // -------------------------------
  // 📊 Dashboard
  // -------------------------------
  getStats: () => api.get('/dashboard/stats'),
  getStatsByCompany: () => api.get('/dashboard/by-company'),
  getStatsByDepartment: (companyId) =>
    api.get('/dashboard/by-department', { params: { companyId } }),
  getStatsByLevel: (companyId) =>
    api.get('/dashboard/by-level', { params: { companyId } }),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),

  // -------------------------------
  // 🏢 Companies - CRUD
  // -------------------------------
  getCompanies: () => api.get('/companies'),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),

  // -------------------------------
  // 🏬 Departments - CRUD
  // -------------------------------
  getDepartments: (companyId) =>
    api.get('/departments', { params: { companyId } }),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  // -------------------------------
  // 🧱 Job Levels - CRUD
  // -------------------------------
  getJobLevels: () => api.get('/job-levels'),
  createJobLevel: (data) => api.post('/job-levels', data),
  updateJobLevel: (id, data) => api.put(`/job-levels/${id}`, data),
  deleteJobLevel: (id) => api.delete(`/job-levels/${id}`),

  // -------------------------------
  // 📄 Job Descriptions - CRUD
  // -------------------------------
  getJobDescriptions: (params) => api.get('/job-descriptions', { params }),
  getJobDescriptionById: (id) => api.get(`/job-descriptions/${id}`),
  checkSimilarity: (data) => api.post('/job-descriptions/check-similarity', data),
  generateJobDescription: (data) => api.post('/job-descriptions/generate', data),
  updateJobDescription: (id, data) => api.put(`/job-descriptions/${id}`, data),
  deleteJobDescription: (id) => api.delete(`/job-descriptions/${id}`),
  approveJobDescription: (id, approvedBy) =>
    api.post(`/job-descriptions/${id}/approve`, { approvedBy }),
  rejectJobDescription: (id, reason) =>
    api.post(`/job-descriptions/${id}/reject`, { reason }),

  exportJobDescriptionDOCX: (id) => {
    window.open(`${API_BASE_URL}/api/job-descriptions/${id}/export/docx`, '_blank');
  },
  exportJobDescriptionPDF: (id) => {
    window.open(`${API_BASE_URL}/api/job-descriptions/${id}/export/pdf`, '_blank');
  },

  // -------------------------------
  // 🧩 Templates
  // -------------------------------
  getTemplates: () => api.get('/templates'),
  createTemplate: (data) => api.post('/templates', data),
  updateTemplate: (id, data) => api.put(`/templates/${id}`, data),

  // -------------------------------
  // 👔 Positions
  // -------------------------------
  getPositions: (companyId) => api.get('/positions', { params: { companyId } }),

  // -------------------------------
  // 👥 Users
  // -------------------------------
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  // -------------------------------
  // ⚙️ Settings
  // -------------------------------
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;
