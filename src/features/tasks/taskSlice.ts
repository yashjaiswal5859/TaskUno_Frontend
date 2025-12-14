import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import taskService from './taskService';
import { Task, TaskCreate, TaskUpdate, TaskState, RootState } from '../../types';

const initialState: TaskState = {
  tasks: [],
  task: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new task
export const createTask = createAsyncThunk<Task, TaskCreate, { rejectValue: string }>(
  'tasks/create',
  async (taskData, thunkAPI) => {
    try {
      const result = await taskService.createTask(taskData);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to create task');
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

// Get Multiple Tasks
export const getTasks = createAsyncThunk<Task[], void, { rejectValue: string }>(
  'tasks/getTask',
  async (_, thunkAPI) => {
    try {
      const result = await taskService.getTasks();
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

// Get single task
export const getTask = createAsyncThunk<Task, number, { rejectValue: string }>(
  'tasks/get',
  async (taskId, thunkAPI) => {
    try {
      const result = await taskService.getTask(taskId);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to get task');
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

// Update single task
export const updateTask = createAsyncThunk<Task, TaskUpdate, { rejectValue: string }>(
  'tasks/update',
  async (taskData, thunkAPI) => {
    try {
      const result = await taskService.updateTask(taskData);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to update task');
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

// Delete task
export const deleteTask = createAsyncThunk<void, number, { rejectValue: string }>(
  'tasks/delete',
  async (taskId, thunkAPI) => {
    try {
      await taskService.deleteTask(taskId);
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    reset: () => initialState,
    resetVariables: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to create task';
      })
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get tasks';
      })
      .addCase(getTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.task = action.payload;
      })
      .addCase(getTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get task';
      })
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.task = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to update task';
      })
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to delete task';
      });
  },
});

export const { reset, resetVariables } = taskSlice.actions;
export default taskSlice.reducer;

