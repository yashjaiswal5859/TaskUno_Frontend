import axiosInstance from '../../utils/axiosInterceptor';
import { AxiosError } from 'axios';
import { Project, ProjectCreate, ProjectUpdate } from '../../types';

const API_URL = '/project/';

// Create new project
const createProject = async (projectData: ProjectCreate): Promise<Project | undefined> => {
  try {
    const response = await axiosInstance.post<Project>(API_URL, projectData);
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

// Get user projects
const getProjects = async (): Promise<Project[] | undefined> => {
  try {
    const response = await axiosInstance.get<Project[]>(API_URL);
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

// Get single Project
const getProject = async (projectId: number): Promise<Project | undefined> => {
  try {
    const response = await axiosInstance.get<Project>(API_URL + projectId);
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

// Update Project
const updateProject = async (data: ProjectUpdate): Promise<Project | undefined> => {
  try {
    // Extract the ID from the data payload
    const response = await axiosInstance.patch<Project>(API_URL + data.id, data);
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

// Delete single Project
const deleteProject = async (projectId: number): Promise<void> => {
  try {
    await axiosInstance.delete(API_URL + projectId);
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Something went wrong';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
  }
};

const projectService = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjects,
};

export default projectService;

