import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playlistApi } from '../../services/playlistApi';

export const fetchMyPlaylists = createAsyncThunk('playlists/fetchMine', async () => {
  const { data } = await playlistApi.getMine();
  return data.data;
});

export const fetchPlaylistById = createAsyncThunk('playlists/fetchOne', async (id) => {
  const { data } = await playlistApi.getOne(id);
  return data.data;
});

export const createPlaylist = createAsyncThunk('playlists/create', async (payload) => {
  const { data } = await playlistApi.create(payload);
  return data.data;
});

export const updatePlaylist = createAsyncThunk('playlists/update', async ({ id, payload }) => {
  const { data } = await playlistApi.update(id, payload);
  return data.data;
});

export const deletePlaylist = createAsyncThunk('playlists/delete', async (id) => {
  await playlistApi.remove(id);
  return id;
});

export const addTrackToPlaylist = createAsyncThunk(
  'playlists/addTrack',
  async ({ playlistId, spotifyId }) => {
    await playlistApi.addTrack(playlistId, spotifyId);
    return playlistId;
  }
);

export const removeTrackFromPlaylist = createAsyncThunk(
  'playlists/removeTrack',
  async ({ playlistId, trackId }) => {
    await playlistApi.removeTrack(playlistId, trackId);
    return { playlistId, trackId };
  }
);

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState: {
    items: [], 
    activePlaylist: null, 
    status: 'idle',
    error: null,
  },
  reducers: {
    clearActivePlaylist(state) {
      state.activePlaylist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPlaylists.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchPlaylistById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlaylistById.fulfilled, (state, action) => {
        state.activePlaylist = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.items.unshift({ ...action.payload, _count: { tracks: 0 } });
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
        if (state.activePlaylist?.id === action.payload.id) {
          state.activePlaylist = { ...state.activePlaylist, ...action.payload };
        }
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearActivePlaylist } = playlistsSlice.actions;
export default playlistsSlice.reducer;
