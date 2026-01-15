// Utility functions for authentication
import { cookieService } from '../services/cookieService';

export const getCurrentUserId = (): string | null => {
  try {
    const user = cookieService.getUser();
    if (!user) {
      return null;
    }
    
    return user.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    return cookieService.getUser();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return cookieService.isAuthenticated();
};
