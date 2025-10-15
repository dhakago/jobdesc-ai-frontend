import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Dashboard
  getStats: () => api.get('/api/dashboard/stats'),
  getStatsByCompany: () => api.get('/api/dashboard/by-company'),
  getStatsByDepartment: (companyId) => 
    api.get('/api/dashboard/by-department', { params: { companyId } }),
  getStatsByLevel: (companyId) => 
    api.get('/api/dashboard/by-level', { params: { companyId } }),
  getRecentActivity: () => api.get('/api/dashboard/recent-activity'),
  
  // Companies - CRUD
  getCompanies: () => api.get('/api/companies'),
  createCompany: (data) => api.post('/api/companies', data),
  updateCompany: (id, data) => api.put(`/api/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/api/companies/${id}`),
  
  // Departments - CRUD
  getDepartments: (companyId) => 
    api.get('/api/departments', { params: { companyId } }),
  getDepartmentsByCompany: (companyId) => 
    api.get('/api/departments', { params: { companyId } }),
  createDepartment: (data) => api.post('/api/departments', data),
  updateDepartment: (id, data) => api.put(`/api/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/api/departments/${id}`),
  
  // Job Levels
  getJobLevels: () => api.get('/api/job-levels'),
  createJobLevel: (data) => api.post('/api/job-levels', data),
  updateJobLevel: (id, data) => api.put(`/api/job-levels/${id}`, data),
  deleteJobLevel: (id) => api.delete(`/api/job-levels/${id}`),
  
  // Job Descriptions - CRUD
  getJobDescriptions: (params) => 
    api.get('/api/job-descriptions', { params }),
  getJobDescriptionById: (id) => 
    api.get(`/api/job-descriptions/${id}`),
  checkSimilarity: (data) => 
    api.post('/api/job-descriptions/check-similarity', data),
  generateJobDescription: (data) => 
    api.post('/api/job-descriptions/generate', data),
  updateJobDescription: (id, data) => 
    api.put(`/api/job-descriptions/${id}`, data),
  deleteJobDescription: (id) => 
    api.delete(`/api/job-descriptions/${id}`),
  approveJobDescription: (id, approvedBy) => 
    api.post(`/api/job-descriptions/${id}/approve`, { approvedBy }),
  rejectJobDescription: (id, reason) => 
    api.post(`/api/job-descriptions/${id}/reject`, { reason }),
  exportJobDescriptionDOCX: (id) => {
    window.open(`${API_BASE_URL}/api/job-descriptions/${id}/export/docx`, '_blank');
  },
  exportJobDescriptionPDF: (id) => {
    window.open(`${API_BASE_URL}/api/job-descriptions/${id}/export/pdf`, '_blank');
  },
  
  // Templates
  getTemplates: () => api.get('/api/templates'),
  createTemplate: (data) => api.post('/api/templates', data),
  updateTemplate: (id, data) => api.put(`/api/templates/${id}`, data),
  
  // Positions
  getPositions: (companyId) => 
    api.get('/api/positions', { params: { companyId } }),
  
  // Users
  getUsers: () => api.get('/api/users'),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  
  // Settings
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.put('/api/settings', data),
};

export default api;
