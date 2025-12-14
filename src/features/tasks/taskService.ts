import axiosInstance from '../../utils/axiosInterceptor';
import { AxiosError } from 'axios';
import { Task, TaskCreate, TaskUpdate } from '../../types';

const API_URL = '/task/';

// Create new task
const createTask = async (taskData: TaskCreate): Promise<Task | undefined> => {
  try {
    const response = await axiosInstance.post<Task>(API_URL, taskData);
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

// Get user tasks
const getTasks = async (): Promise<Task[] | undefined> => {
  try {
    const response = await axiosInstance.get<Task[]>(API_URL);
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

// Get single Task
const getTask = async (taskId: number): Promise<Task | undefined> => {
  try {
    const response = await axiosInstance.get<Task>(API_URL + taskId);
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

// Update Task
const updateTask = async (data: TaskUpdate): Promise<Task | undefined> => {
  try {
    // Extract the ID from the data payload
    const response = await axiosInstance.patch<Task>(API_URL + data.id, data);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string; message?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = error.response.data?.detail || 'Permission denied';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || error.response.data?.message || 'Bad request';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    // Throw error so it can be caught by the caller
    throw new Error(errorMessage);
  }
};

// Delete single Task
const deleteTask = async (taskId: number): Promise<void> => {
  try {
    await axiosInstance.delete(API_URL + taskId);
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
  }
};

const taskService = {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getTasks,
};

export default taskService;

