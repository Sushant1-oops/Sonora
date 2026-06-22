import api from './apiClient';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: (payload) => api.post('/auth/logout', payload),
  logoutAll: () => api.post('/auth/logout-all'),
  refresh: (payload) => api.post('/auth/refresh', payload),
  me: () => api.get('/auth/me'),
};
