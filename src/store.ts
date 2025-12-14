import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import taskReducer from './features/tasks/taskSlice';
import projectReducer from './features/projects/projectSlice';
import adminReducer from './features/admin/adminSlice';
import { RootState } from './types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    taskData: taskReducer,
    adminData: adminReducer,
    projectData: projectReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Typed hooks for use throughout the app
export { useDispatch, useSelector } from 'react-redux';
export type { TypedUseSelectorHook } from 'react-redux';

