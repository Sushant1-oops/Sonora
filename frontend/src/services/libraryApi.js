import api from './apiClient';

export const libraryApi = {
  likeTrack: (spotifyId) => api.post('/library/likes', { spotifyId }),
  unlikeTrack: (trackId) => api.delete(`/library/likes/${trackId}`),
  getLikedTracks: (params = {}) => api.get('/library/likes', { params }),

  recordPlay: (spotifyId) => api.post('/library/recently-played', { spotifyId }),
  getRecentlyPlayed: (params = {}) => api.get('/library/recently-played', { params }),

  followArtist: (artistName, spotifyArtistId) =>
    api.post('/library/follows', { artistName, spotifyArtistId }),
  unfollowArtist: (artistName) => api.delete(`/library/follows/${encodeURIComponent(artistName)}`),
  getFollowedArtists: () => api.get('/library/follows'),
};
