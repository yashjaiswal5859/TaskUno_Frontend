import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import projectService from './projectService';
import { Project, ProjectCreate, ProjectUpdate, ProjectState, RootState } from '../../types';

const initialState: ProjectState = {
  projects: [],
  project: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new project
export const createProject = createAsyncThunk<Project, ProjectCreate, { rejectValue: string }>(
  'projects/create',
  async (projectData, thunkAPI) => {
    try {
      const result = await projectService.createProject(projectData);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to create project');
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

// Get Multiple Projects
export const getProjects = createAsyncThunk<Project[], void, { rejectValue: string }>(
  'projects/getProject',
  async (_, thunkAPI) => {
    try {
      const result = await projectService.getProjects();
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to get projects');
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

// Get single Project
export const getProject = createAsyncThunk<Project, number, { rejectValue: string }>(
  'projects/get',
  async (projectId, thunkAPI) => {
    try {
      const result = await projectService.getProject(projectId);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to get project');
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

// Update single project
export const updateProject = createAsyncThunk<Project, ProjectUpdate, { rejectValue: string }>(
  'projects/update',
  async (projectData, thunkAPI) => {
    try {
      const result = await projectService.updateProject(projectData);
      if (!result) {
        return thunkAPI.rejectWithValue('Failed to update project');
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

// Delete project
export const deleteProject = createAsyncThunk<void, number, { rejectValue: string }>(
  'projects/delete',
  async (projectId, thunkAPI) => {
    try {
      await projectService.deleteProject(projectId);
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const projectSlice = createSlice({
  name: 'project',
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
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProject.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to create project';
      })
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get projects';
      })
      .addCase(getProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.project = action.payload;
      })
      .addCase(getProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to get project';
      })
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to update project';
      })
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProject.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to delete project';
      });
  },
});

export const { reset, resetVariables } = projectSlice.actions;
export default projectSlice.reducer;

