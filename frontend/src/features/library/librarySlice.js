import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { libraryApi } from '../../services/libraryApi';

export const fetchLikedTracks = createAsyncThunk('library/fetchLiked', async () => {
  const { data } = await libraryApi.getLikedTracks();
  return data.data;
});

export const likeTrack = createAsyncThunk('library/like', async (track) => {
  const spotifyId = typeof track === 'string' ? track : track.spotifyId;
  const { data } = await libraryApi.likeTrack(spotifyId);
  return data.data;
});

export const unlikeTrack = createAsyncThunk('library/unlike', async (payload) => {
  const trackIdOrSpotifyId = typeof payload === 'string' ? payload : (payload.trackId || payload.spotifyId);
  await libraryApi.unlikeTrack(trackIdOrSpotifyId);
  return payload;
});

export const fetchRecentlyPlayed = createAsyncThunk('library/fetchRecent', async () => {
  const { data } = await libraryApi.getRecentlyPlayed();
  return data.data;
});

export const recordPlay = createAsyncThunk('library/recordPlay', async (spotifyId) => {
  const { data } = await libraryApi.recordPlay(spotifyId);
  return data.data;
});

export const fetchFollowedArtists = createAsyncThunk('library/fetchFollowed', async () => {
  const { data } = await libraryApi.getFollowedArtists();
  return data.data;
});

export const followArtist = createAsyncThunk(
  'library/follow',
  async ({ artistName, spotifyArtistId }) => {
    const { data } = await libraryApi.followArtist(artistName, spotifyArtistId);
    return data.data;
  }
);

export const unfollowArtist = createAsyncThunk('library/unfollow', async (artistName) => {
  await libraryApi.unfollowArtist(artistName);
  return artistName;
});

const librarySlice = createSlice({
  name: 'library',
  initialState: {
    likedTracks: [], 
    recentlyPlayed: [],
    followedArtists: [],
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikedTracks.fulfilled, (state, action) => {
        state.likedTracks = action.payload;
        state.status = 'succeeded';
      })
      .addCase(likeTrack.pending, (state, action) => {
        const track = action.meta.arg;
        if (track && typeof track === 'object') {
          const spotifyId = track.spotifyId;
          const exists = state.likedTracks.some((l) => l.track?.spotifyId === spotifyId);
          if (!exists) {
            state.likedTracks.unshift({
              id: 'temp-' + Date.now(),
              trackId: track.id || spotifyId,
              track: track,
            });
          }
        }
      })
      .addCase(likeTrack.fulfilled, (state, action) => {
        const track = action.meta.arg;
        const spotifyId = typeof track === 'string' ? track : track?.spotifyId;
        state.likedTracks = state.likedTracks.filter(
          (l) => l.track?.spotifyId !== spotifyId && l.trackId !== spotifyId
        );
        state.likedTracks.unshift(action.payload);
      })
      .addCase(likeTrack.rejected, (state, action) => {
        const track = action.meta.arg;
        const spotifyId = typeof track === 'string' ? track : track?.spotifyId;
        state.likedTracks = state.likedTracks.filter(
          (l) => l.track?.spotifyId !== spotifyId && l.trackId !== spotifyId
        );
      })
      .addCase(unlikeTrack.pending, (state, action) => {
        const payload = action.meta.arg;
        const trackId = typeof payload === 'string' ? payload : payload.trackId;
        const spotifyId = typeof payload === 'string' ? payload : payload.spotifyId;
        state.likedTracks = state.likedTracks.filter(
          (l) => l.trackId !== trackId && l.track?.spotifyId !== spotifyId
        );
      })
      .addCase(fetchRecentlyPlayed.fulfilled, (state, action) => {
        state.recentlyPlayed = action.payload;
      })
      .addCase(fetchFollowedArtists.fulfilled, (state, action) => {
        state.followedArtists = action.payload;
      })
      .addCase(followArtist.fulfilled, (state, action) => {
        state.followedArtists.unshift(action.payload);
      })
      .addCase(unfollowArtist.fulfilled, (state, action) => {
        state.followedArtists = state.followedArtists.filter(
          (a) => a.artistName !== action.payload
        );
      });
  },
});

export default librarySlice.reducer;


export const selectIsLiked = (state, trackIdOrSpotifyId) =>
  state.library.likedTracks.some(
    (l) => l.trackId === trackIdOrSpotifyId || l.track?.spotifyId === trackIdOrSpotifyId
  );

export const selectLikedRecord = (state, trackIdOrSpotifyId) =>
  state.library.likedTracks.find(
    (l) => l.trackId === trackIdOrSpotifyId || l.track?.spotifyId === trackIdOrSpotifyId
  );
