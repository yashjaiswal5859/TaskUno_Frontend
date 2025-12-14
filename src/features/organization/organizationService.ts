import axiosInstance from '../../utils/axiosInterceptor';
import { AxiosError } from 'axios';
import { OrganizationChart, OrganizationMember } from '../../types';

export interface Organization {
  id: number;
  name: string;
}

const API_URL = '/organization/';

// Get all organizations
const getAllOrganizations = async (): Promise<Organization[] | undefined> => {
  try {
    const response = await axiosInstance.get<Organization[]>(API_URL);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Failed to fetch organizations';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    return undefined;
  }
};

// Get organization chart (3-layer structure)
const getOrganizationChart = async (): Promise<OrganizationChart | undefined> => {
  try {
    const response = await axiosInstance.get<OrganizationChart>(API_URL + 'chart');
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Failed to fetch organization chart';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
    return undefined;
  }
};

// Get all developers in the organization
const getDevelopers = async (): Promise<OrganizationMember[] | undefined> => {
  try {
    const response = await axiosInstance.get<OrganizationMember[]>(API_URL + 'developers');
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Failed to fetch developers';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
    // Don't show toast for this as it might be called frequently
    console.error(errorMessage);
    return undefined;
  }
};

// Get all product owners in the organization
const getProductOwners = async (): Promise<OrganizationMember[] | undefined> => {
  try {
    const response = await axiosInstance.get<OrganizationMember[]>(API_URL + 'product-owners');
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = 'Failed to fetch product owners';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized access, please login again.';
    }
    // Don't show toast for this as it might be called frequently
    console.error(errorMessage);
    return undefined;
  }
};

const organizationService = {
  getAllOrganizations,
  getOrganizationChart,
  getDevelopers,
  getProductOwners,
};

export default organizationService;

