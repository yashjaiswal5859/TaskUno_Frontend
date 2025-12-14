import { getRole } from './storage';
import { useAppSelector } from '../hooks/redux';

/**
 * Check if current user is a Product Owner
 */
export const isProductOwner = (): boolean => {
  const role = getRole();
  return role === 'Product Owner';
};

/**
 * Check if current user is a Developer
 */
export const isDeveloper = (): boolean => {
  const role = getRole();
  return role === 'Developer';
};

/**
 * Hook to get user role from Redux state
 */
export const useUserRole = (): string | null => {
  const { user, profile } = useAppSelector((state) => state.auth);
  return profile?.role || user?.user?.role || getRole() || null;
};

/**
 * Hook to check if user can manage tasks/projects
 * Only Product Owners and admins can manage tasks/projects
 * Always reads from local storage as source of truth
 */
export const useCanManageTasks = (): boolean => {
  // Always read from local storage as source of truth
  const role = getRole();
  return role === 'Product Owner' || role === 'admin';
};

