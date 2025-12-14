import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import adminService from './adminService';
import { User, Task, AdminState, RootState } from '../../types';

const initialState: AdminState = {
  users: [],
  tasks: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get Multiple Tasks
export const getTasks = createAsyncThunk<Task[], void, { rejectValue: string }>(
  'admin/tasks',
  async (_, thunkAPI) => {
    try {
      const result = await adminService.getTasks();
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to get tasks');
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

// Delete Multiple Tasks
export const deleteTasks = createAsyncThunk<void, void, { rejectValue: string }>(
  'admin/tasks/delete',
  async (_, thunkAPI) => {
    try {
      await adminService.deleteTasks();
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get Multiple Users
export const getUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'admin/users',
  async (_, thunkAPI) => {
    try {
      const result = await adminService.getUsers();
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to get users');
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

export const adminSlice = createSlice({
  name: 'admin',
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
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get users';
        state.users = [];
      })
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tasks = action.payload;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get tasks';
        state.tasks = [];
      })
      .addCase(deleteTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTasks.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to delete tasks';
      });
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;

