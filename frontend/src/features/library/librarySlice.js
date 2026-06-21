import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { libraryApi } from '../../services/libraryApi';
import toast from 'react-hot-toast';

export const fetchLikedTracks = createAsyncThunk('library/fetchLiked', async () => {
  const { data } = await libraryApi.getLikedTracks();
  return data.data;
});

export const likeTrack = createAsyncThunk('library/like', async (spotifyId) => {
  const { data } = await libraryApi.likeTrack(spotifyId);
  toast.success('Added to Liked Songs');
  return data.data;
});

export const unlikeTrack = createAsyncThunk('library/unlike', async (trackId) => {
  await libraryApi.unlikeTrack(trackId);
  toast.success('Removed from Liked Songs');
  return trackId;
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
    toast.success(`Following ${artistName}`);
    return data.data;
  }
);

export const unfollowArtist = createAsyncThunk('library/unfollow', async (artistName) => {
  await libraryApi.unfollowArtist(artistName);
  toast.success(`Unfollowed ${artistName}`);
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

export const selectIsTrackLiked = (state, track) => {
  if (!track) return false;
  return state.library.likedTracks.some(
    (l) => (track.id && l.trackId === track.id) || (track.spotifyId && l.track?.spotifyId === track.spotifyId)
  );
};
