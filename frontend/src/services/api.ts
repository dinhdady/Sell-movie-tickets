import axios from 'axios';
import type { Movie, Showtime } from '../types/movie';
import type { Booking } from '../types/booking';
import type { User, AuthRequest, RegisterRequest, AuthResponse } from '../types/auth';
import type { ResponseObject, PaginatedResponse, VnpayRequest, VNPayResponseDTO } from '../types/api';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: AuthRequest): Promise<ResponseObject<AuthResponse>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ResponseObject<AuthResponse>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<ResponseObject> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ResponseObject> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Movie API
export const movieAPI = {
  getAll: async (page = 0, size = 10): Promise<PaginatedResponse<Movie>> => {
    const response = await api.get(`/movie?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<Movie>> => {
    const response = await api.get(`/movie/${id}`);
    return response.data;
  },

  getNowShowing: async (): Promise<ResponseObject<Movie[]>> => {
    const response = await api.get('/movie/now-showing');
    return response.data;
  },

  getComingSoon: async (): Promise<ResponseObject<Movie[]>> => {
    const response = await api.get('/movie/coming-soon');
    return response.data;
  },

  search: async (query: string): Promise<ResponseObject<Movie[]>> => {
    const response = await api.get(`/movie/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getByGenre: async (genre: string): Promise<ResponseObject<Movie[]>> => {
    const response = await api.get(`/movie/by-genre/${encodeURIComponent(genre)}`);
    return response.data;
  },

  getGenres: async (): Promise<ResponseObject<string[]>> => {
    const response = await api.get('/movie/genres');
    return response.data;
  },

  getShowtimes: async (movieId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/movie/${movieId}/showtimes`);
    return response.data;
  },

  advancedSearch: async (params: {
    title?: string;
    genre?: string;
    status?: string;
    minRating?: number;
    maxRating?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ResponseObject<Movie[]>> => {
    const response = await api.get('/movie/advanced-search', { params });
    return response.data;
  },
};

// Showtime API
export const showtimeAPI = {
  getAll: async (): Promise<Showtime[]> => {
    const response = await api.get('/showtime');
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<Showtime>> => {
    const response = await api.get(`/showtime/${id}`);
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  getAll: async (): Promise<Booking[]> => {
    const response = await api.get('/booking');
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<Booking>> => {
    const response = await api.get(`/booking/${id}`);
    return response.data;
  },

  create: async (bookingData: Partial<Booking>): Promise<ResponseObject<Booking>> => {
    const response = await api.post('/booking', bookingData);
    return response.data;
  },

  update: async (id: number, bookingData: Partial<Booking>): Promise<ResponseObject<Booking>> => {
    const response = await api.put(`/booking/${id}`, bookingData);
    return response.data;
  },

  delete: async (id: number): Promise<ResponseObject> => {
    const response = await api.delete(`/booking/${id}`);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<ResponseObject<User>> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ResponseObject<User>> => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createVNPayPayment: async (paymentData: VnpayRequest): Promise<string> => {
    const response = await api.post('/vnpay', paymentData);
    return response.data;
  },

  getTicketsByOrderId: async (orderId: string): Promise<VNPayResponseDTO> => {
    const response = await api.get(`/vnpay/tickets/${orderId}`);
    return response.data;
  },
};

export default api;
