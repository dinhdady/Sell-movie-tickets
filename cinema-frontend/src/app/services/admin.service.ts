import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Booking Management
  getAllBookings(page: number, size: number, status?: string, movieTitle?: string, username?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) params = params.set('status', status);
    if (movieTitle) params = params.set('movieTitle', movieTitle);
    if (username) params = params.set('username', username);
    
    return this.http.get(`${this.apiUrl}/admin/bookings`, { params });
  }

  getBookingById(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/${bookingId}`);
  }

  updateBookingStatus(bookingId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/bookings/${bookingId}/status`, { status });
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/bookings/${bookingId}`);
  }

  getBookingStats(period?: string): Observable<any> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    return this.http.get(`${this.apiUrl}/admin/bookings/stats`, { params });
  }

  getShowtimeSeats(showtimeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/showtime/${showtimeId}/seats`);
  }

  searchBookings(query: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/admin/bookings/search`, { params });
  }

  exportBookings(startDate?: string, endDate?: string, format?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (format) params = params.set('format', format);
    return this.http.get(`${this.apiUrl}/admin/bookings/export`, { params });
  }

  // Dashboard Analytics
  getDashboardOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/overview`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`);
  }

  getTopRevenueMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/top-movies`);
  }

  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/user-analytics`);
  }

  getBookingAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/booking-analytics`);
  }

  getRevenueAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/revenue-analytics`);
  }

  // User Management
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/admin/all`);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/admin/${userId}`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/admin/${userId}/role`, { role });
  }

  toggleUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/admin/${userId}/status`, { isActive });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/admin/${userId}`);
  }

  searchUsers(query: string): Observable<any> {
    const params = new HttpParams().set('q', query);
    return this.http.get(`${this.apiUrl}/user/admin/search`, { params });
  }

  getUsersStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/admin/stats`);
  }

  getUserBookings(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/admin/${userId}/bookings`);
  }

  getUserPayments(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/admin/${userId}/payments`);
  }
} 