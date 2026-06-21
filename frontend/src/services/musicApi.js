import api from './apiClient';

export const musicApi = {
  search: (q, params = {}) => api.get('/music/search', { params: { q, ...params } }),
  getPopular: (params = {}) => api.get('/music/popular', { params }),
  getGenres: () => api.get('/music/genres'),
  getArtistTracks: (artistId, params = {}) =>
    api.get(`/music/artists/${artistId}/tracks`, { params }),
  getTrack: (jamendoId) => api.get(`/music/tracks/${jamendoId}`),
};
