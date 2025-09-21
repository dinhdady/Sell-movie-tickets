import axios from 'axios';
import type { Movie, Showtime } from '../types/movie';
import type { User, AuthRequest, RegisterRequest, AuthResponse } from '../types/auth';
// import type { Seat } from '../types/booking';
import { tokenService } from './tokenService';

interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: 'STANDARD' | 'SPECIAL' | 'VIP';
  createdAt?: string;
  rooms?: Room[];
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
  cinema?: Cinema;
  createdAt?: string;
  seats?: Seat[];
}

interface Seat {
  id: number;
  seatNumber: string;
  rowNumber: string;
  columnNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE';
  roomId: number;
  status?: string;
}

export interface ApiBooking {
  id: number;
  userId: string;
  createdAt: string;
  status: string;
  movie: {
    id: number;
    title: string;
    posterUrl?: string;
    genre?: string;
    duration?: number;
  };
  showtime: {
    id: number;
    startTime: string;
    endTime: string;
    room: {
      id: number;
      name: string;
      capacity?: number;
      cinema: {
        id: number;
        name: string;
        address: string;
        phone?: string;
        cinemaType?: string;
      };
    };
  };
  order: {
    id: number;
    status: string;
    tickets: Array<{
      id: number;
      seat: {
        seatNumber: string;
        rowNumber: string;
        columnNumber: number;
        seatType: 'REGULAR' | 'VIP' | 'COUPLE';
        price: number;
      };
      price: number;
      status: string;
      qrCodeUrl?: string;
    }>;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
}
import type { ResponseObject, VnpayRequest, VNPayResponseDTO } from '../types/api';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0, // Disable automatic redirects
  validateStatus: function (status) {
    return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
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

// Response interceptor to handle errors and auto refresh token
api.interceptors.response.use(
  (response) => {
    // Handle 302 redirects as successful responses
    if (response.status === 302) {
      console.log('API redirect (302) - treating as success:', response.data);
      return response;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 302) {
      console.log('API redirect (302) in error handler:', error.response.data);
      // Return the response data as if it was successful
      return Promise.resolve(error.response);
    }
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('🔄 [API] Token expired, attempting to refresh...');
        const newToken = await tokenService.refreshAccessToken();
        
        // Update the authorization header with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        console.log('✅ [API] Token refreshed, retrying original request...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ [API] Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Only redirect to login for actual authentication errors, not for other 401s
    if (error.response?.status === 401 && error.response?.data?.message?.includes('authentication')) {
      tokenService.clearTokens();
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

  refreshToken: async (refreshToken: string): Promise<ResponseObject<AuthResponse>> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
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

  create: async (movieData: any, posterFile?: File): Promise<ResponseObject<Movie>> => {
    const formData = new FormData();
    
    // Add all movie data fields
    Object.keys(movieData).forEach(key => {
      if (movieData[key] !== null && movieData[key] !== undefined) {
        formData.append(key, movieData[key]);
      }
    });
    
    // Add poster file if provided
    if (posterFile) {
      formData.append('posterImg', posterFile);
    }
    
    console.log('📤 [API] Sending movie creation request');
    console.log('📋 [API] Form data keys:', Array.from(formData.keys()));
    console.log('🎭 [API] Cast value:', formData.get('cast'));
    console.log('🎬 [API] FilmRating value:', formData.get('filmRating'));
    console.log('📁 [API] Poster file:', posterFile?.name || 'No file');
    
    // Log all form data values
    console.log('📋 [API] All form data values:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const response = await api.post('/movie/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('📥 [API] Response status:', response.status);
    console.log('📥 [API] Response data:', response.data);
    
    return response.data;
  },

  update: async (id: number, movieData: any, posterFile?: File): Promise<ResponseObject<Movie>> => {
    const formData = new FormData();
    
    // Add all movie data fields
    Object.keys(movieData).forEach(key => {
      if (movieData[key] !== null && movieData[key] !== undefined) {
        formData.append(key, movieData[key]);
      }
    });
    
    // Add poster file if provided
    if (posterFile) {
      formData.append('posterImg', posterFile);
    }
    
    console.log('📤 [API] Sending movie update request for ID:', id);
    console.log('📋 [API] Form data keys:', Array.from(formData.keys()));
    console.log('🎭 [API] Cast value:', formData.get('cast'));
    console.log('🎬 [API] FilmRating value:', formData.get('filmRating'));
    console.log('📁 [API] Poster file:', posterFile?.name || 'No file');
    
    // Log all form data values
    console.log('📋 [API] All form data values:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const response = await api.put(`/movie/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('📥 [API] Update response status:', response.status);
    console.log('📥 [API] Update response data:', response.data);
    
    return response.data;
  },

  delete: async (id: number): Promise<ResponseObject> => {
    const response = await api.delete(`/movie/${id}`);
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

  getByMovie: async (movieId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/showtime/movie/${movieId}`);
    return response.data;
  },

  getByRoom: async (roomId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/showtime/room/${roomId}`);
    return response.data;
  },

  getByCinema: async (cinemaId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/showtime/cinema/${cinemaId}`);
    return response.data;
  },
  getByMovieAndRoom: async (movieId: number, roomId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/showtime/movie/${movieId}/room/${roomId}`);
    return response.data;
  },

  create: async (showtimeData: any): Promise<ResponseObject<Showtime>> => {
    const response = await api.post('/showtime', showtimeData);
    return response.data;
  },

  update: async (id: number, showtimeData: any): Promise<ResponseObject<Showtime>> => {
    const response = await api.put(`/showtime/${id}`, showtimeData);
    return response.data;
  },

  delete: async (id: number): Promise<ResponseObject<any>> => {
    const response = await api.delete(`/showtime/${id}`);
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  getAll: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/booking');
    return response.data;
  },

  getAllWithDetails: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/admin/bookings');
    return response.data.object?.content || response.data.object || [];
  },

  getById: async (id: number): Promise<ResponseObject<ApiBooking>> => {
    const response = await api.get(`/booking/${id}`);
    return response.data;
  },

  getDetailsById: async (id: number): Promise<ResponseObject<ApiBooking>> => {
    const response = await api.get(`/booking/${id}/details`);
    return response.data;
  },

  create: async (bookingData: Partial<ApiBooking>): Promise<ResponseObject<ApiBooking>> => {
    const response = await api.post('/booking', bookingData);
    return response.data;
  },

  update: async (id: number, bookingData: Partial<ApiBooking>): Promise<ResponseObject<ApiBooking>> => {
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

  // Admin endpoints
  getAllUsers: async (): Promise<ResponseObject<User[]>> => {
    const response = await api.get('/user/admin/all');
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<ResponseObject<User>> => {
    const response = await api.post('/user/admin/create', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<ResponseObject<User>> => {
    const response = await api.put(`/user/admin/${userId}`, userData);
    return response.data;
  },

  getUserById: async (userId: string): Promise<ResponseObject<User>> => {
    const response = await api.get(`/user/admin/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<ResponseObject<User>> => {
    const response = await api.put(`/user/admin/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean): Promise<ResponseObject<User>> => {
    const response = await api.put(`/user/admin/${userId}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<ResponseObject> => {
    const response = await api.delete(`/user/admin/${userId}`);
    return response.data;
  },

  searchUsers: async (query: string): Promise<ResponseObject<User[]>> => {
    const response = await api.get(`/user/admin/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getUsersStats: async (): Promise<ResponseObject<any>> => {
    const response = await api.get('/user/admin/stats');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async (): Promise<ResponseObject<any>> => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  getRevenueStats: async (): Promise<ResponseObject<any>> => {
    const response = await api.get('/dashboard/revenue-stats');
    return response.data;
  },

  getBookingStats: async (): Promise<ResponseObject<any>> => {
    const response = await api.get('/dashboard/booking-stats');
    return response.data;
  },
};

// Cinema API
export const cinemaAPI = {
  getAll: async (): Promise<ResponseObject<Cinema[]>> => {
    const response = await api.get('/cinema');
    return response.data;
  },

  getById: async (id: number): Promise<Cinema> => {
    const response = await api.get(`/cinema/${id}`);
    return response.data;
  },

  create: async (cinema: Partial<Cinema>): Promise<ResponseObject<Cinema>> => {
    const response = await api.post('/cinema', cinema);
    return response.data;
  },

  update: async (id: number, cinema: Partial<Cinema>): Promise<ResponseObject<Cinema>> => {
    const response = await api.put(`/cinema/${id}`, cinema);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/cinema/${id}`);
  },
};

// Room API
export const roomAPI = {
  getAll: async (): Promise<ResponseObject<Room[]>> => {
    const response = await api.get('/room');
    return response.data;
  },

  getById: async (id: number): Promise<ResponseObject<Room>> => {
    const response = await api.get(`/room/${id}`);
    return response.data;
  },

  getByCinema: async (cinemaId: number): Promise<ResponseObject<Room[]>> => {
    const response = await api.get(`/room/cinema/${cinemaId}`);
    return response.data;
  },

  create: async (room: Partial<Room>): Promise<ResponseObject<Room>> => {
    const response = await api.post('/room', room);
    return response.data;
  },

  update: async (id: number, room: Partial<Room>): Promise<ResponseObject<Room>> => {
    const response = await api.put(`/room/${id}`, room);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/room/${id}`);
  },
};

// Seat API
export const seatAPI = {
  getByRoom: async (roomId: number): Promise<ResponseObject<Seat[]>> => {
    const response = await api.get(`/seat/room/${roomId}`);
    return response.data;
  },

  getById: async (seatId: number): Promise<ResponseObject<Seat>> => {
    const response = await api.get(`/seat/${seatId}`);
    return response.data;
  },

  getRoomInfo: async (roomId: number): Promise<ResponseObject<any>> => {
    const response = await api.get(`/seat/room/${roomId}/info`);
    return response.data;
  },

  generateDefault: async (roomId: number): Promise<ResponseObject<Seat[]>> => {
    const response = await api.post(`/seat/generate-default/${roomId}`);
    return response.data;
  },

  generateCustom: async (roomId: number, config: any): Promise<ResponseObject<Seat[]>> => {
    const response = await api.post(`/seat/generate-custom/${roomId}`, config);
    return response.data;
  },

  generate: async (roomId: number, config?: any): Promise<ResponseObject<Seat[]>> => {
    const response = await api.post(`/seat/generate/${roomId}`, config || {});
    return response.data;
  },

  deleteByRoom: async (roomId: number): Promise<ResponseObject<void>> => {
    const response = await api.delete(`/seat/room/${roomId}`);
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

  sendBookingEmail: async (bookingId: number, htmlContent: string, subject: string, toEmail: string): Promise<ResponseObject> => {
    const response = await api.post(`/booking/${bookingId}/send-email`, {
      htmlContent,
      subject,
      toEmail
    });
    return response.data;
  },
};

export default api;
