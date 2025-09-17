import axios from 'axios';
import type { Movie, Showtime } from '../types/movie';
import type { User, AuthRequest, RegisterRequest, AuthResponse } from '../types/auth';
import type { Seat } from '../types/booking';

interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: 'STANDARD' | 'PREMIUM' | 'IMAX' | '4DX';
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
}

interface Booking {
  id: number;
  userId: string;
  showtimeId: number;
  totalPrice: number;
  totalAmount: number;
  status: string;
  bookingStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
}
import type { ResponseObject, VnpayRequest, VNPayResponseDTO } from '../types/api';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for actual authentication errors, not for other 401s
    if (error.response?.status === 401 && error.response?.data?.message?.includes('authentication')) {
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
    console.log('Login API response:', response.data);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ResponseObject<AuthResponse>> => {
    console.log('Sending registration data:', userData);
    const response = await api.post('/auth/register', userData);
    console.log('Registration response:', response.data);
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
  getAll: async (page = 0, size = 10): Promise<{ movies: Movie[]; currentPage: number; totalItems: number; totalPages: number }> => {
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
  getByMovieId: async (movieId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/showtime/movie/${movieId}`);
    return response.data;
  },

  getAll: async (): Promise<ResponseObject<Showtime[]>> => {
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

// Cinema API
export const cinemaAPI = {
  getAll: async (): Promise<ResponseObject<Cinema[]>> => {
    const response = await api.get('/cinema');
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<Cinema>> => {
    const response = await api.get(`/cinema/${id}`);
    return response.data;
  },
};

// Room API
export const roomAPI = {
  getAll: async (): Promise<ResponseObject<Room[]>> => {
    const response = await api.get('/room');
    return response.data;
  },

  getByCinema: async (cinemaId: number): Promise<ResponseObject<Room[]>> => {
    const response = await api.get(`/room/cinema/${cinemaId}`);
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<any>> => {
    const response = await api.get(`/room/${id}`);
    return response.data;
  },
};

// Seat API
export const seatAPI = {
  getByRoomId: async (roomId: number): Promise<ResponseObject<Seat[]>> => {
    const response = await api.get(`/seat/room/${roomId}`);
    return response.data;
  },

  getAvailableSeats: async (showtimeId: number): Promise<ResponseObject<Seat[]>> => {
    const response = await api.get(`/seat/available/${showtimeId}`);
    return response.data;
  },

  getSeatAvailability: async (showtimeId: number, roomId: number): Promise<ResponseObject<Seat[]>> => {
    const response = await api.get(`/seat/availability?showtimeId=${showtimeId}&roomId=${roomId}`);
    return response.data;
  },
};

// Order API
export const orderAPI = {
  create: async (orderData: any): Promise<ResponseObject<any>> => {
    const response = await api.post('/order', orderData);
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<any>> => {
    const response = await api.get(`/order/${id}`);
    return response.data;
  },

  getByTxnRef: async (txnRef: string): Promise<ResponseObject<any>> => {
    const response = await api.get(`/order/txnRef/${txnRef}`);
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

  verifyPayment: async (paymentData: any): Promise<ResponseObject<any>> => {
    const response = await api.post('/vnpay/verify', paymentData);
    return response.data;
  },

  getBookingByTxnRef: async (txnRef: string): Promise<any> => {
    const response = await api.get(`/booking/txnRef/${txnRef}`);
    console.log('movie:', response?.data?.object?.movie);
    console.log('movie title:', response?.data?.object?.movie?.title);
    console.log('tickets:', response?.data?.object?.order?.tickets);
    return response.data;
  },

  confirmPayment: async (txnRef: string): Promise<ResponseObject<any>> => {
    const response = await api.post(`/booking/confirm-payment/${txnRef}`);
    return response.data;
  },
};

export default api;
