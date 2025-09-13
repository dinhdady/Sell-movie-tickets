import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

export interface Booking {
  id?: number;
  userId: string;
  showtimeId: number;
  orderId: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: any;
  showtime?: any;
  order?: any;
}

export interface BookingDTO {
  userId: string;
  showtimeId: number;
  orderId: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/booking';

  constructor(private http: HttpClient) { }

  // Lấy tất cả đặt vé
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((data: any[]) => data.map(item => ({
        ...item,
        userId: item.user_id,
        showtimeId: item.showtime_id,
        orderId: item.order_id
      }))),
      catchError(this.handleError)
    );
  }

  // Lấy đặt vé theo ID
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Tạo đặt vé
  createBooking(bookingData: any): Observable<any> {
    // Gửi đúng tên trường camelCase cho backend
    // Cho phép userId là null cho guest bookings
    const payload = {
      userId: bookingData.userId || null, // Allow null for guest bookings
      showtimeId: bookingData.showtimeId,
      orderId: bookingData.orderId,
      totalPrice: bookingData.totalPrice,
      seatIds: bookingData.seatIds || [], // Include seat IDs for seat assignment
      customerName: bookingData.customerName || '',
      customerEmail: bookingData.customerEmail || '',
      customerPhone: bookingData.customerPhone || '',
      customerAddress: bookingData.customerAddress || ''
    };
    console.log('[BookingService] Creating booking with payload:', payload);
    return this.http.post<any>('http://localhost:8080/api/booking', payload).pipe(
      catchError(this.handleError)
    );
  }

  // Cập nhật đặt vé
  updateBooking(id: number, booking: Booking): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, booking).pipe(
      catchError(this.handleError)
    );
  }

  // Xóa đặt vé
  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy đặt vé theo người dùng
  getBookingsByUser(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy đặt vé theo suất chiếu
  getBookingsByShowtime(showtimeId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/showtime/${showtimeId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy ghế đã đặt theo suất chiếu
  getBookedSeats(showtimeId: number): Observable<string[]> {
    return this.http.get<any>(`http://localhost:8080/api/booking/showtime/${showtimeId}/seats`).pipe(
      catchError(this.handleError),
      // Trả về mảng số ghế (seatNumbers)
      // Nếu backend trả về object, lấy object hoặc []
      // Nếu trả về mảng, trả về luôn
      // Nếu trả về object có object, lấy object
      // Nếu trả về object có bookedSeats, lấy bookedSeats
      // Nếu trả về object có seatNumbers, lấy seatNumbers
      // Nếu không, trả về []
      // (Tùy backend, có thể cần chỉnh lại)
      // Ví dụ: {object: ["A1", "A2"]} hoặc {bookedSeats: ["A1", "A2"]}
      // Hoặc chỉ là ["A1", "A2"]
      // Ưu tiên lấy object, sau đó bookedSeats, sau đó seatNumbers
      // Nếu không có, trả về []
      //
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.object && Array.isArray(response.object)) return response.object;
        if (response?.bookedSeats && Array.isArray(response.bookedSeats)) return response.bookedSeats;
        if (response?.seatNumbers && Array.isArray(response.seatNumbers)) return response.seatNumbers;
        return [];
      })
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
          errorMessage = 'Dữ liệu đặt vé không hợp lệ. Vui lòng kiểm tra lại.';
          break;
        case 401:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập.';
          break;
        case 404:
          errorMessage = 'Đặt vé không tồn tại.';
          break;
        case 409:
          errorMessage = 'Đặt vé đã tồn tại hoặc có xung đột.';
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
