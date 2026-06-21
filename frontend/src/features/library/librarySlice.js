import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { libraryApi } from '../../services/libraryApi';

export const fetchLikedTracks = createAsyncThunk('library/fetchLiked', async () => {
  const { data } = await libraryApi.getLikedTracks();
  return data.data;
});

export const likeTrack = createAsyncThunk('library/like', async (jamendoId) => {
  const { data } = await libraryApi.likeTrack(jamendoId);
  return data.data;
});

export const unlikeTrack = createAsyncThunk('library/unlike', async (trackId) => {
  await libraryApi.unlikeTrack(trackId);
  return trackId;
});

export const fetchRecentlyPlayed = createAsyncThunk('library/fetchRecent', async () => {
  const { data } = await libraryApi.getRecentlyPlayed();
  return data.data;
});

export const recordPlay = createAsyncThunk('library/recordPlay', async (jamendoId) => {
  const { data } = await libraryApi.recordPlay(jamendoId);
  return data.data;
});

export const fetchFollowedArtists = createAsyncThunk('library/fetchFollowed', async () => {
  const { data } = await libraryApi.getFollowedArtists();
  return data.data;
});

export const followArtist = createAsyncThunk(
  'library/follow',
  async ({ artistName, jamendoArtistId }) => {
    const { data } = await libraryApi.followArtist(artistName, jamendoArtistId);
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
      .addCase(likeTrack.fulfilled, (state, action) => {
        state.likedTracks.unshift(action.payload);
      })
      .addCase(unlikeTrack.fulfilled, (state, action) => {
        state.likedTracks = state.likedTracks.filter((l) => l.trackId !== action.payload);
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


export const selectIsLiked = (state, trackId) =>
  state.library.likedTracks.some((l) => l.trackId === trackId);
