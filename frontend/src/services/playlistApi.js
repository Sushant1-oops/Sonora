import api from './apiClient';

export const playlistApi = {
  create: (payload) => api.post('/playlists', payload),
  getMine: () => api.get('/playlists/me'),
  getOne: (id) => api.get(`/playlists/${id}`),
  update: (id, payload) => api.patch(`/playlists/${id}`, payload),
  remove: (id) => api.delete(`/playlists/${id}`),
  addTrack: (id, spotifyId) => api.post(`/playlists/${id}/tracks`, { spotifyId }),
  removeTrack: (id, trackId) => api.delete(`/playlists/${id}/tracks/${trackId}`),
  reorder: (id, trackIds) => api.patch(`/playlists/${id}/reorder`, { trackIds }),
};
