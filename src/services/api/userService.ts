import { User } from '../../types/User';
import { apiService } from '../apiService';

// Authenticate a user
export const authenticateUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await apiService.post('/auth/login', { email, password });
    const { data } = response;
    
    if (data.success) {
      // Store the token
      localStorage.setItem('auth_token', data.data.access_token);
      return data.data.user;
    }
    throw new Error(data.message || 'Authentication failed');
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const response = await apiService.post('/auth/signup', { email, password, name });
    const { data } = response;
    
    if (data.success) {
      // Store the token upon signup for automatic login
      localStorage.setItem('auth_token', data.data.access_token);
      return data.data.user;
    }
    throw new Error(data.message || 'Registration failed');
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Get current user info
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiService.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}; 