import axiosInstance from "../../utils/axiosInterceptor";
import { AxiosError } from "axios";
import { AuthResponse, LoginRequest, RegisterRequest, User, TokenResponse } from "../../types";
import { setAuthData, clearAuthData } from "../../utils/storage";

const API_URL = "/auth/";

// Register user
const register = async (userData: RegisterRequest): Promise<AuthResponse | undefined> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(API_URL, userData);

    if (response.data) {
      console.log('Registration response:', response.data);
      // Ensure data is stored in localStorage
      setAuthData(response.data);
      console.log('Data stored in localStorage');
    } else {
      console.error('No data in registration response');
    }
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = "Something went wrong";
    if (error.response?.status === 401) {
      errorMessage = "Unauthorized access, please login again.";
    }
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || errorMessage;
    }
    if (error.response?.status === 403) {
      errorMessage = error.response.data?.detail || "Forbidden: Only Product Owners can register.";
    }
    console.error('Registration error:', errorMessage, error.response?.data);
    return undefined;
  }
};

// Login user
const login = async (userData: LoginRequest): Promise<AuthResponse | undefined> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(API_URL + "login", userData);

    if (response.data) {
      setAuthData(response.data);
    }
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = "Something went wrong";
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || errorMessage;
    }
    if (error.response?.status === 404) {
      errorMessage = error.response.data?.detail || errorMessage;
    }
    return undefined;
  }
};

// Logout user
const logout = (): void => {
  clearAuthData();
};

// Get user profile
const getUserProfile = async (): Promise<User | undefined> => {
  try {
    const response = await axiosInstance.get<User>(API_URL + "profile");
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = "Something went wrong";
    if (error.response?.status === 401) {
      errorMessage = error.response.data?.detail || errorMessage;
      clearAuthData();
      // redirect to login
      window.location.href = "/login";
    }
    if (error.response?.status === 404) {
      errorMessage = error.response.data?.detail || errorMessage;
    }
    return undefined;
  }
};

// Refresh access token
const refreshToken = async (refreshToken: string): Promise<TokenResponse | undefined> => {
  try {
    const response = await axiosInstance.post<TokenResponse>(API_URL + "refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    clearAuthData();
    window.location.href = "/login";
    return undefined;
  }
};

// Invite user (Product Owner only)
interface InviteUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'Product Owner' | 'Developer';
}

const inviteUser = async (userData: InviteUserData): Promise<User | undefined> => {
  try {
    const response = await axiosInstance.post<User>(API_URL + "invite", userData);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    let errorMessage = "Something went wrong";
    if (error.response?.status === 401) {
      errorMessage = "Unauthorized access, please login again.";
    }
    if (error.response?.status === 403) {
      errorMessage = error.response.data?.detail || "Only Product Owners can invite users";
    }
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

const authService = {
  register,
  logout,
  login,
  getUserProfile,
  refreshToken,
  inviteUser,
};

export default authService;

