import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from './authService';
import { AuthResponse, User, LoginRequest, RegisterRequest, AuthState, TokenResponse } from '../../types';
import { getAuthData, setAuthData, clearAuthData, updateTokens } from '../../utils/storage';

// Get user from localStorage using new utility
const authData = getAuthData();
const user: AuthResponse | null = authData ? {
  tokens: authData.tokens,
  user: authData.user
} : null;

const initialState: AuthState = {
  user: user,
  profile: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Register new user
export const register = createAsyncThunk<AuthResponse, RegisterRequest, { rejectValue: string }>(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const result = await authService.register(userData);
      if (!result) {
        return thunkAPI.rejectWithValue('Registration failed');
      }
      return result;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const result = await authService.login(userData);
      if (!result) {
        return thunkAPI.rejectWithValue('Login failed');
      }
      return result;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

// Get User Profile
export const getUserProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/profile',
  async (_, thunkAPI) => {
    try {
      const result = await authService.getUserProfile();
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to get profile');
      }
      return result;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Refresh token
export const refreshToken = createAsyncThunk<TokenResponse, void, { rejectValue: string }>(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    try {
      const authData = getAuthData();
      if (!authData?.tokens?.refresh_token) {
        return thunkAPI.rejectWithValue('No refresh token available');
      }
      const result = await authService.refreshToken(authData.tokens.refresh_token);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to refresh token');
      }
      updateTokens(result);
      return result;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        console.log('Register fulfilled, storing in localStorage:', action.payload);
        setAuthData(action.payload);
        console.log('setAuthData completed');
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Registration failed';
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        setAuthData(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Login failed';
        state.user = null;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get profile';
        state.profile = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        clearAuthData();
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<TokenResponse>) => {
        if (state.user) {
          state.user.tokens = action.payload;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.profile = null;
        clearAuthData();
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

