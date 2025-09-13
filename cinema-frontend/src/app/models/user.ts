export interface User {
  id?: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterRequest {
  usernameR: string;
  emailR: string;
  passwordR: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message: string;
}
