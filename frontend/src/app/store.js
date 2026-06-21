import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import playerReducer from '../features/player/playerSlice';
import playlistsReducer from '../features/playlists/playlistsSlice';
import libraryReducer from '../features/library/librarySlice';
import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    playlists: playlistsReducer,
    library: libraryReducer,
    search: searchReducer,
  },
});
