import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = 'http://localhost:8080/api'; // Base API URL

  constructor(private http: HttpClient) {}

  // Lấy danh sách tất cả các rạp chiếu phim
  getCinemas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cinema`).pipe(
      tap(data => console.log('[SeatService] Fetched cinemas:', data)),
      catchError(this.handleErrorWithAuth<any[]>('getCinemas', []))
    );
  }

  // Lấy danh sách các phòng trong một rạp chiếu phim cụ thể
  getRoomsByCinema(cinemaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cinemas/${cinemaId}/rooms`).pipe(
      tap(data => console.log(`[SeatService] Fetched rooms for cinema ${cinemaId}:`, data)),
      catchError(this.handleErrorWithAuth<any[]>(`getRoomsByCinema id=${cinemaId}`, []))
    );
  }

  // Lấy sơ đồ ghế của một phòng
  getSeatsByRoom(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/seat?roomId=${roomId}`).pipe(
      tap(data => console.log(`[SeatService] Fetched seats for room ${roomId}:`, data)),
      catchError(this.handleErrorWithAuth<any[]>(`getSeatsByRoom id=${roomId}`, []))
    );
  }

  // Lấy danh sách các ghế đã được đặt cho một suất chiếu
  getBookedSeats(showtimeId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/showtimes/${showtimeId}/booked-seats`).pipe(
      tap(data => console.log(`[SeatService] Fetched booked seats for showtime ${showtimeId}:`, data)),
      catchError(this.handleErrorWithAuth<string[]>(`getBookedSeats id=${showtimeId}`, []))
    );
  }

  // Hàm xử lý lỗi chung
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`[SeatService] ${operation} failed:`, error);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  // Hàm xử lý lỗi với xử lý đặc biệt cho lỗi xác thực
  private handleErrorWithAuth<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`[SeatService] ${operation} failed:`, error);
      
      // Nếu là lỗi 401 (Unauthorized), không xử lý ở đây mà để interceptor xử lý
      if (error.status === 401) {
        console.log(`[SeatService] ${operation}: 401 error detected, letting interceptor handle it`);
        throw error; // Re-throw để interceptor có thể xử lý
      }
      
      // Let the app keep running by returning an empty result for other errors.
      return of(result as T);
    };
  }
} 