import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { authAPI, userAPI } from '../services/api';
import { tokenService } from '../services/tokenService';
import { cookieService } from '../services/cookieService';
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: AuthRequest) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterRequest) => Promise<AuthResponse | undefined>;
  googleLogin: (googleData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setAuth: (token: string, user: User) => void; // New method to set auth state
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
      const storedToken = cookieService.getToken();
      const storedUser = cookieService.getUser();
      if (storedToken && storedUser) {
        // Check if token is expired
        if (tokenService.isTokenExpired(storedToken)) {
          try {
            const newToken = await tokenService.refreshAccessToken();
            setToken(newToken);
            setUser(storedUser);
          } catch (error) {
            tokenService.clearTokens();
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(storedToken);
          // Ensure user has a valid ID (string format like backend UUID)
          if (!storedUser.id || storedUser.id === 0) {
            storedUser.id = Math.random().toString(36).substring(2, 10);
            cookieService.setUser(storedUser);
          }
          setUser(storedUser);
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
        console.log('[AuthContext] Auto-refreshing token...');
        const newToken = await tokenService.refreshAccessToken();
        setToken(newToken);
        console.log('[AuthContext] Token auto-refresh successful');
      } catch (error) {
        console.error('[AuthContext] Auto-refresh failed:', error);
        // Don't logout immediately, let the next API call handle it
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user, token]);
  const login = async (credentials: AuthRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      if (response.state === 'SUCCESS') {
        const authResponse = response.object;
        const newToken = authResponse.accessToken;
        // Store token first
        setToken(newToken);
        cookieService.setToken(newToken);
        cookieService.setRefreshToken(authResponse.refreshToken);
        // Fetch real user profile from backend
        try {
          const userProfileResponse = await userAPI.getProfile();
          if (userProfileResponse.state === '200') {
            const realUser = userProfileResponse.object;
            // Ensure role is properly formatted as string
            if (realUser.role && typeof realUser.role === 'object') {
              realUser.role = String(realUser.role);
            }
            setUser(realUser);
            cookieService.setUser(realUser);
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (profileError) {
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
          cookieService.setUser(fallbackUser);
        }
        return { success: true, message: 'Đăng nhập thành công' };
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      // Don't re-throw if it's already a successful login being treated as error
      if (error instanceof Error && error.message.includes('thành công')) {
        return { success: true, message: error.message };
      }
      
      // Handle different types of errors
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Clear any existing tokens on login failure
      setToken(null);
      cookieService.clearAuth();
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      if (response.state === 'SUCCESS') {
        // Kiểm tra nếu cần xác thực email
        if (response.object && response.object.verificationRequired) {
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
        cookieService.setToken(newToken);
        cookieService.setUser(newUser);
        cookieService.setRefreshToken(authResponse.refreshToken);
        return;
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const googleLogin = async (googleData: any) => {
    try {
      setIsLoading(true);
      const response = await authAPI.googleLogin(googleData);
      if (response.state === 'SUCCESS') {
        const authResponse = response.object;
        const newToken = authResponse.accessToken;
        // Store token first
        setToken(newToken);
        cookieService.setToken(newToken);
        cookieService.setRefreshToken(authResponse.refreshToken);
        // Fetch real user profile from backend
        try {
          const userProfileResponse = await userAPI.getProfile();
          if (userProfileResponse.state === '200') {
            const realUser = userProfileResponse.object;
            // Ensure role is properly formatted as string
            if (realUser.role && typeof realUser.role === 'object') {
              realUser.role = String(realUser.role);
            }
            setUser(realUser);
            cookieService.setUser(realUser);
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (profileError) {
          // Fallback to basic user object if profile fetch fails
          const fallbackUser = {
            id: Math.random().toString(36).substring(2, 10),
            username: googleData.email,
            email: googleData.email,
            fullName: googleData.name,
            phone: googleData.phone || '',
            birthday: googleData.birthday || '',
            role: 'USER' as const,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          setUser(fallbackUser);
          cookieService.setUser(fallbackUser);
        }
        return { success: true, message: 'Đăng nhập Google thành công' };
      } else {
        throw new Error(response.message || 'Đăng nhập Google thất bại');
      }
    } catch (error: any) {
      // Handle different types of errors
      let errorMessage = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Clear any existing tokens on login failure
      setToken(null);
      cookieService.clearAuth();
      
      throw new Error(errorMessage);
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
      cookieService.setUser(updatedUser);
    }
  };
  
  // Method to set authentication state (used by GoogleAuthCallback)
  const setAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    cookieService.setToken(newToken);
    cookieService.setUser(newUser);
  };
  
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    setAuth,
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
