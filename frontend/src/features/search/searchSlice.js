import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { musicApi } from '../../services/musicApi';

export const searchTracks = createAsyncThunk('search/tracks', async ({ query, genre }) => {
  const { data } = await musicApi.search(query, { type: 'tracks', genre });
  return data.data;
});

export const searchArtists = createAsyncThunk('search/artists', async (query) => {
  const { data } = await musicApi.search(query, { type: 'artists' });
  return data.data;
});

export const fetchPopular = createAsyncThunk('search/popular', async (genre) => {
  const { data } = await musicApi.getPopular({ genre });
  return data.data;
});

export const fetchGenres = createAsyncThunk('search/genres', async () => {
  const { data } = await musicApi.getGenres();
  return data.data;
});

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    trackResults: [],
    artistResults: [],
    popular: [],
    genres: [],
    activeGenre: null,
    status: 'idle',
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    setActiveGenre(state, action) {
      state.activeGenre = action.payload;
    },
    clearResults(state) {
      state.trackResults = [];
      state.artistResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchTracks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchTracks.fulfilled, (state, action) => {
        state.trackResults = action.payload;
        state.status = 'succeeded';
      })
      .addCase(searchTracks.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(searchArtists.fulfilled, (state, action) => {
        state.artistResults = action.payload;
      })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.popular = action.payload;
      })
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
      });
  },
});

export const { setQuery, setActiveGenre, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
