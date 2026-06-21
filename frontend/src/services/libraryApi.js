import api from './apiClient';

export const libraryApi = {
  likeTrack: (jamendoId) => api.post('/library/likes', { jamendoId }),
  unlikeTrack: (trackId) => api.delete(`/library/likes/${trackId}`),
  getLikedTracks: (params = {}) => api.get('/library/likes', { params }),

  recordPlay: (jamendoId) => api.post('/library/recently-played', { jamendoId }),
  getRecentlyPlayed: (params = {}) => api.get('/library/recently-played', { params }),

  followArtist: (artistName, jamendoArtistId) =>
    api.post('/library/follows', { artistName, jamendoArtistId }),
  unfollowArtist: (artistName) => api.delete(`/library/follows/${encodeURIComponent(artistName)}`),
  getFollowedArtists: () => api.get('/library/follows'),
};
