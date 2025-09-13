import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Showtime {
  id?: number;
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
  movie?: any;
  room?: any;
  bookings?: any[];
}

export interface ShowtimeDTO {
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {
  private apiUrl = 'http://localhost:8080/api/showtime';

  constructor(private http: HttpClient) { }

  // Lấy tất cả suất chiếu
  getAllShowtimes(): Observable<Showtime[]> {
    return this.http.get<Showtime[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy suất chiếu theo ID
  getShowtimeById(id: number): Observable<Showtime> {
    return this.http.get<Showtime>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Tạo suất chiếu mới
  createShowtime(showtimeDto: ShowtimeDTO): Observable<any> {
    return this.http.post(this.apiUrl, showtimeDto).pipe(
      catchError(this.handleError)
    );
  }

  // Cập nhật suất chiếu
  updateShowtime(id: number, showtime: Showtime): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, showtime).pipe(
      catchError(this.handleError)
    );
  }

  // Xóa suất chiếu
  deleteShowtime(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy suất chiếu theo phim
  getShowtimesByMovie(movieId: number): Observable<Showtime[]> {
    return this.http.get<Showtime[]>(`${this.apiUrl}/movie/${movieId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy suất chiếu theo phòng
  getShowtimesByRoom(roomId: number): Observable<Showtime[]> {
    return this.http.get<Showtime[]>(`${this.apiUrl}/room/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy suất chiếu theo ngày
  getShowtimesByDate(date: Date): Observable<Showtime[]> {
    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<Showtime[]>(`${this.apiUrl}/date/${dateStr}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy suất chiếu sắp tới
  getUpcomingShowtimes(): Observable<Showtime[]> {
    return this.http.get<Showtime[]>(`${this.apiUrl}/upcoming`).pipe(
      catchError(this.handleError)
    );
  }

  // Kiểm tra xung đột suất chiếu
  checkShowtimeConflict(roomId: number, startTime: Date, endTime: Date, excludeId?: number): Observable<boolean> {
    const params = {
      roomId: roomId.toString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      excludeId: excludeId?.toString() || ''
    };
    
    return this.http.get<boolean>(`${this.apiUrl}/check-conflict`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy ghế đã đặt cho suất chiếu
  getBookedSeats(showtimeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${showtimeId}/booked-seats`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy thống kê suất chiếu
  getShowtimeStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi kết nối: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Dữ liệu suất chiếu không hợp lệ. Vui lòng kiểm tra lại.';
          break;
        case 401:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập.';
          break;
        case 404:
          errorMessage = 'Suất chiếu không tồn tại.';
          break;
        case 409:
          errorMessage = 'Suất chiếu đã tồn tại hoặc có xung đột thời gian.';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          break;
      }
    }

    return throwError(() => ({
      status: 'ERROR',
      message: errorMessage,
      originalError: error
    }));
  }
}
