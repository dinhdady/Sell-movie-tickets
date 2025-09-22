import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { authAPI, userAPI } from '../services/api';
import { tokenService } from '../services/tokenService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: AuthRequest) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterRequest) => Promise<AuthResponse | undefined>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Check if token is expired
        if (tokenService.isTokenExpired(storedToken)) {
          console.log('🔄 [AuthContext] Access token expired, attempting refresh...');
          try {
            const newToken = await tokenService.refreshAccessToken();
            setToken(newToken);
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('❌ [AuthContext] Token refresh failed:', error);
            tokenService.clearTokens();
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          // Ensure user has a valid ID (string format like backend UUID)
          if (!parsedUser.id || parsedUser.id === 0) {
            parsedUser.id = Math.random().toString(36).substring(2, 10);
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }
          setUser(parsedUser);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Auto refresh token every 10 minutes
  useEffect(() => {
    if (!user || !token) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 [AuthContext] Auto refreshing token...');
        const newToken = await tokenService.refreshAccessToken();
        setToken(newToken);
        console.log('✅ [AuthContext] Token auto-refreshed successfully');
      } catch (error) {
        console.error('❌ [AuthContext] Auto token refresh failed:', error);
        // Don't logout immediately, let the next API call handle it
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [user, token]);

  const login = async (credentials: AuthRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      console.log('AuthContext received response:', response);
      console.log('Response state:', response.state);
      console.log('Response object:', response.object);
      
      if (response.state === 'SUCCESS') {
        const authResponse = response.object;
        console.log('Auth response object:', authResponse);
        const newToken = authResponse.accessToken;
        console.log('Extracted token:', newToken);
        
        // Store token first
        setToken(newToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', authResponse.refreshToken);
        
        // Fetch real user profile from backend
        try {
          const userProfileResponse = await userAPI.getProfile();
          if (userProfileResponse.state === '200') {
            const realUser = userProfileResponse.object;
            // Ensure role is properly formatted as string
            if (realUser.role && typeof realUser.role === 'object') {
              realUser.role = String(realUser.role);
            }
            console.log('Real user from backend:', realUser);
            setUser(realUser);
            localStorage.setItem('user', JSON.stringify(realUser));
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Fallback to basic user object if profile fetch fails
          const fallbackUser = {
            id: Math.random().toString(36).substring(2, 10),
            username: credentials.username,
            email: credentials.username + '@example.com',
            fullName: credentials.username,
            phone: '',
            role: 'USER' as const,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
        return { success: true, message: 'Đăng nhập thành công' };
      } else {
        console.log('Login failed with state:', response.state);
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Don't re-throw if it's already a successful login being treated as error
      if (error instanceof Error && error.message.includes('thành công')) {
        return { success: true, message: error.message };
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      console.log('AuthContext register called with:', userData);
      const response = await authAPI.register(userData);
      
      if (response.state === 'SUCCESS') {
        // Kiểm tra nếu cần xác thực email
        if (response.object && response.object.verificationRequired) {
          console.log('Email verification required for:', response.object.email);
          return response.object; // Trả về thông tin verification
        }
        
        const authResponse = response.object;
        const newToken = authResponse.accessToken;
        
        // Create user object from registration data
        const newUser = {
          id: Math.random().toString(36).substring(2, 10),
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          phone: userData.phone,
          role: 'USER' as const,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('refreshToken', authResponse.refreshToken);
        return;
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    tokenService.clearTokens();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    loading: isLoading, // Alias for isLoading
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
