import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserSettings } from '../types/User';
import { authenticateUser, registerUser, getCurrentUser } from '../services/api/userService';

interface UserContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  updateUserProfile: (profile: Partial<User['profile']>) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Generate initials from name
  const generateInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Fetch user info with the stored token
          const user = await getCurrentUser();
          
          // Add initials
          if (user && user.name) {
            user.initials = generateInitials(user.name);
          }
          
          setUser(user);
          setIsAuthenticated(true);
        } catch (err) {
          // Token may be invalid, clear it
          localStorage.removeItem('auth_token');
          console.error('Error verifying token:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authenticateUser(email, password);
      
      // Add initials
      if (user && user.name) {
        user.initials = generateInitials(user.name);
      }
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await registerUser(email, password, name);
      
      // Add initials
      if (user && user.name) {
        user.initials = generateInitials(user.name);
      }
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    if (!user) return;
    
    setUser({
      ...user,
      settings: {
        ...user.settings,
        ...settings
      },
      updated_at: new Date().toISOString()
    });
  };

  const updateUserProfile = (profile: Partial<User['profile']>) => {
    if (!user) return;
    
    setUser({
      ...user,
      profile: {
        ...user.profile,
        ...profile
      },
      updated_at: new Date().toISOString()
    });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateUserSettings,
    updateUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 