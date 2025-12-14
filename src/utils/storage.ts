import { AuthResponse, User, TokenResponse } from '../types';

const AUTH_STORAGE_KEY = 'auth_data';
const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const USER_STORAGE_KEY = 'user';
const ORG_ID_STORAGE_KEY = 'organization_id';
const ORG_NAME_STORAGE_KEY = 'organization_name';
const ROLE_STORAGE_KEY = 'user_role';

export interface StoredAuthData {
  tokens: TokenResponse;
  user: User;
  organization_id?: number;
  organization_name?: string;
}

/**
 * Store complete authentication data in localStorage
 */
export const setAuthData = (authResponse: AuthResponse): void => {
  try {
    console.log('setAuthData called with:', authResponse);
    
    if (!authResponse || !authResponse.tokens || !authResponse.user) {
      console.error('Invalid authResponse structure:', authResponse);
      return;
    }
    
    const authData: StoredAuthData = {
      tokens: authResponse.tokens,
      user: authResponse.user,
      organization_id: authResponse.user.organization_id,
      organization_name: authResponse.user.organization_name,
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authResponse.tokens.refresh_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse.user));
    
    if (authResponse.user.organization_id) {
      localStorage.setItem(ORG_ID_STORAGE_KEY, authResponse.user.organization_id.toString());
    }
    if (authResponse.user.organization_name) {
      localStorage.setItem(ORG_NAME_STORAGE_KEY, authResponse.user.organization_name);
    }
    if (authResponse.user.role) {
      localStorage.setItem(ROLE_STORAGE_KEY, authResponse.user.role);
    }
    
    // Dispatch storage event for cross-tab synchronization
    window.dispatchEvent(new Event('storage'));
    
    console.log('Successfully stored auth data in localStorage');
  } catch (error) {
    console.error('Error storing auth data in localStorage:', error);
  }
};

/**
 * Get complete authentication data from localStorage
 */
export const getAuthData = (): StoredAuthData | null => {
  try {
    const authDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authDataStr) return null;
    return JSON.parse(authDataStr) as StoredAuthData;
  } catch {
    return null;
  }
};

/**
 * Get access token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

/**
 * Get user data from localStorage
 */
export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * Get organization ID from localStorage
 */
export const getOrganizationId = (): number | null => {
  const orgIdStr = localStorage.getItem(ORG_ID_STORAGE_KEY);
  if (!orgIdStr) return null;
  const orgId = parseInt(orgIdStr, 10);
  return isNaN(orgId) ? null : orgId;
};

/**
 * Get organization name from localStorage
 */
export const getOrganizationName = (): string | null => {
  return localStorage.getItem(ORG_NAME_STORAGE_KEY);
};

/**
 * Get user role from localStorage
 */
export const getRole = (): string | null => {
  return localStorage.getItem(ROLE_STORAGE_KEY);
};

/**
 * Update tokens in localStorage (after refresh)
 */
export const updateTokens = (tokens: TokenResponse): void => {
  const authData = getAuthData();
  if (authData) {
    authData.tokens = tokens;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token);
    window.dispatchEvent(new Event('storage'));
  }
};

/**
 * Clear all authentication data from localStorage
 * Also clears ALL localStorage to ensure nothing is left behind
 */
export const clearAuthData = (): void => {
  // Clear specific auth keys
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(ORG_ID_STORAGE_KEY);
  localStorage.removeItem(ORG_NAME_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  
  // Clear ALL localStorage to ensure nothing is left behind
  localStorage.clear();
  
  window.dispatchEvent(new Event('storage'));
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

