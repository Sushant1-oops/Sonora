import api from './apiClient';

export const userApi = {
  getPublicProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (payload) => api.patch('/users/me', payload),
};
