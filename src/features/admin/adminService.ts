import axiosInstance from '../../utils/axiosInterceptor';
import { AxiosError } from 'axios';
import { User, Task } from '../../types';

// API Gateway base URL
const TASK_API_URL = '/task/';
const AUTH_API_URL = '/auth/';

// Get all users (through auth service via gateway)
// Note: This endpoint may need to be added to the auth service
const getUsers = async (): Promise<User[] | undefined> => {
  try {
    // Using auth service through gateway
    // If this endpoint doesn't exist, it will need to be added to auth-service
    const response = await axiosInstance.get<User[]>(AUTH_API_URL + 'users');
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Users endpoint not found. This feature may need to be implemented in the backend.';
    }
    return undefined;
  }
};

// Get all tasks (through task service via gateway)
const getTasks = async (): Promise<Task[] | undefined> => {
  try {
    const response = await axiosInstance.get<Task[]>(TASK_API_URL);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
    return undefined;
  }
};

// Delete single Task (through task service via gateway)
const deleteTask = async (taskId: number): Promise<void> => {
  try {
    await axiosInstance.delete(TASK_API_URL + taskId);
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
  }
};

// Delete all Tasks
// Note: This endpoint may need to be added to the task service
const deleteTasks = async (): Promise<void> => {
  try {
    // This endpoint may need to be implemented in the backend
    const response = await axiosInstance.delete(TASK_API_URL + 'delete-all');

    if (response) {
      // Tasks deleted successfully
    }
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Delete all tasks endpoint not found. This feature may need to be implemented in the backend.';
    }
  }
};

const adminService = {
  deleteTask,
  getTasks,
  getUsers,
  deleteTasks,
};

export default adminService;

