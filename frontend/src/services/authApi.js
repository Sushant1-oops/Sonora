import api from './apiClient';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};
