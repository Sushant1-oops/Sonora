import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import { setAccessToken } from '../../services/apiClient';





export const bootstrapSession = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.refresh();
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(null);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(payload);
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout().catch(() => {}); 
  setAccessToken(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle', 
    bootstrapped: false, 
    error: null,
  },
  reducers: {
    sessionExpired(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(bootstrapSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
        state.bootstrapped = true;
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.user = null;
        state.status = 'idle';
        state.bootstrapped = true;
      })
      
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
