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
  price?: number;
  status?: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'MAINTENANCE' | 'SELECTED' | 'OCCUPIED';
}
export interface ApiBooking {
  id: number;
  userId?: string;
  createdAt: string;
  status?: string;
  movie: {
    id: number;
    title: string;
    posterUrl?: string;
    genre?: string;
    duration?: number;
    description?: string;
    releaseDate?: string;
    director?: string;
    cast?: string;
    rating?: number;
    language?: string;
    filmRating?: string;
    price?: number;
  };
  showtime: {
    id: number;
    startTime: string;
    endTime: string;
    roomId?: number;
    movieId?: number;
    room: {
      id: number;
      name: string;
      capacity?: number;
      cinemaId?: number;
      cinema: {
        id: number;
        name: string;
        address: string;
        phone?: string;
        cinemaType?: string;
      };
    };
  };
  order?: {
    id: number;
    status: string;
    userId?: string;
    showtimeId?: number;
    totalPrice: number;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    tickets: Array<{
      id: number;
      orderId: number;
      seatId: number;
      price: number;
      token: string;
      status: string;
      qrCodeUrl?: string;
      seat: {
        seatNumber: string;
        rowNumber: string;
        columnNumber: number;
        roomId: number;
        seatType: 'REGULAR' | 'VIP' | 'COUPLE';
        price: number;
      };
    }>;
  };
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalPrice: number;
}
// Type for my-tickets API response
export interface MyTicketResponse {
  id: number;
  token: string;
  price: number;
  status: string;
  qrCodeUrl?: string;
  customerEmail: string;
  customerName?: string;
  totalPrice?: number;
  orderId?: number;
  movieTitle: string;
  moviePosterUrl?: string;
  startTime: string;
  endTime: string;
  roomName: string;
  cinemaName: string;
  cinemaAddress: string;
  seatNumber: string;
  seatType: string;
  rowNumber: number;
  columnNumber: number;
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
  maxRedirects: 0, // Disable automatic redirects
  validateStatus: function (status) {
    return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
  },
});
// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
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
      return response;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log('[API Interceptor] Error response:', error.response?.status, error.response?.data);
    
    // Handle 302 redirects as successful responses
    if (error.response?.status === 302) {
      return Promise.resolve(error.response);
    }
    
    // Don't redirect or refresh for login/register endpoints - let them handle their own errors
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized - try to refresh token (but not for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      console.log('[API Interceptor] 401 error, attempting token refresh...');
      originalRequest._retry = true;
      try {
        const newToken = await tokenService.refreshAccessToken();
        console.log('[API Interceptor] Token refreshed successfully, retrying request...');
        // Update the authorization header with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API Interceptor] Token refresh failed:', refreshError);
        // Clear tokens and redirect to login only if not already on login page
        tokenService.clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Only redirect to login for actual authentication errors, not for other 401s
    if (error.response?.status === 401 && 
        error.response?.data?.message?.includes('authentication') &&
        window.location.pathname !== '/login') {
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
  resetPassword: async (data: { token: string; newPassword: string; confirmPassword: string }): Promise<ResponseObject> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  validateResetToken: async (token: string): Promise<ResponseObject> => {
    const response = await api.get(`/auth/validate-reset-token?token=${token}`);
    return response.data;
  },
  verifyEmail: async (token: string): Promise<ResponseObject> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  resendVerification: async (email: string): Promise<ResponseObject> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
  checkEmailVerification: async (email: string): Promise<ResponseObject> => {
    const response = await api.get(`/auth/check-email-verification?email=${email}`);
    return response.data;
  },
  refreshToken: async (refreshToken: string): Promise<ResponseObject<AuthResponse>> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  googleLogin: async (googleData: any): Promise<ResponseObject<AuthResponse>> => {
    const response = await api.post('/auth/google-login', googleData);
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
    // Log all form data values
    for (const [_key, _value] of formData.entries()) {
    }
    const response = await api.post('/movie/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    // Log all form data values
    for (const [_key, _value] of formData.entries()) {
    }
    const response = await api.put(`/movie/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  getByCinemaId: async (cinemaId: number): Promise<ResponseObject<Showtime[]>> => {
    const response = await api.get(`/showtime/cinema/${cinemaId}`);
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
  createRecurring: async (showtimeData: any): Promise<ResponseObject<any>> => {
    const response = await api.post('/showtime/recurring', showtimeData);
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
    // Backend returns BookingDetailsResponse[] directly, not wrapped in ResponseObject
    return response.data as ApiBooking[];
  },
  getAllWithDetails: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/admin/bookings');
    return response.data.object?.content || response.data.object || [];
  },
  // Admin bookings test endpoint
  getAdminBookingsTest: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/admin/bookings/test');
    return response.data.object || [];
  },
  // Admin bookings chính thức
  getAdminBookings: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/admin/bookings');
    return response.data.object || [];
  },
  // Test endpoint không cần auth - lấy bookings
  testAdminBookings: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/test/bookings');
    return response.data.object?.content || response.data.object || [];
  },
  // Test endpoint lấy tickets
  testAdminTickets: async (): Promise<any[]> => {
    const response = await api.get('/test/tickets');
    return response.data.object?.content || response.data.object || [];
  },
  // Test endpoint lấy tickets với token thực
  testTicketsWithTokens: async (): Promise<any[]> => {
    const response = await api.get('/test/tickets-with-tokens');
    return response.data.object || [];
  },
  // Lấy tất cả tickets (cho admin)
  getAllTickets: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/tickets');
    return response.data.object || [];
  },
  // Lấy tất cả tickets (không cần auth - cho admin management)
  getAllTicketsNoAuth: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/tickets/getAllTickets');
    return response.data.object || [];
  },
  // Lấy chi tiết ticket theo ID (cho admin modal)
  getTicketDetailsById: async (ticketId: number): Promise<any> => {
    const response = await api.get(`/tickets/${ticketId}/details`);
    return response.data.object;
  },
  // Lấy tickets của user hiện tại (cho profile)
  getMyTickets: async (userId: string): Promise<ApiBooking[]> => {
    const response = await api.get(`/tickets/my-tickets?userId=${userId}`);
    return response.data.object || [];
  },
  // Test endpoint tickets
  testTickets: async (): Promise<ApiBooking[]> => {
    const response = await api.get('/tickets/test');
    return response.data.object || [];
  },
  getUserBookings: async (userId: string): Promise<ApiBooking[]> => {
    const response = await api.get(`/user/${userId}/bookings`);
    return response.data.object || [];
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
  // Seat checking APIs
  getAvailableSeats: async (showtimeId: number): Promise<ResponseObject<string[]>> => {
    const response = await api.get(`/booking/${showtimeId}/available-seats`);
    return response.data;
  },
  getBookedSeats: async (showtimeId: number): Promise<ResponseObject<string[]>> => {
    const response = await api.get(`/booking/${showtimeId}/booked-seats`);
    return response.data;
  },
  getSeatStatus: async (showtimeId: number): Promise<ResponseObject<any>> => {
    const response = await api.get(`/booking/${showtimeId}/seat-status`);
    return response.data;
  },
  checkSeatStatus: async (showtimeId: number, seatNumber: string): Promise<ResponseObject<any>> => {
    const response = await api.post(`/booking/${showtimeId}/check-seat/${seatNumber}`);
    return response.data;
  },
};
// User API
export const userAPI = {
  getProfile: async (): Promise<ResponseObject<User>> => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  updateProfile: async (userId: string, userData: Partial<User>): Promise<ResponseObject<User>> => {
    const response = await api.put(`/user/${userId}/profile`, userData);
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
