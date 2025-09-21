// Auth types
export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message: string;
}

// User types
export interface User {
  id: string; // Changed to string to match backend UUID format
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | string;
  isActive: boolean;
  createdAt: string;
  password?: string; // For form only, not stored in backend
}
