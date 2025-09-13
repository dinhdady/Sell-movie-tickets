import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id?: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  registrationDate?: Date;
  role?: string;
  isActive?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  registrationDate: Date;
  role: string;
  totalBookings: number;
  totalSpent: number;
}

export interface UserUpdateDTO {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/user';

  constructor(private http: HttpClient) { }

  // Lấy thông tin người dùng hiện tại
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy profile người dùng chi tiết
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}/profile`).pipe(
      catchError(this.handleError)
    );
  }

  // Cập nhật thông tin người dùng
  updateUserProfile(userId: string, updateDto: UserUpdateDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/profile`, updateDto).pipe(
      catchError(this.handleError)
    );
  }

  // Đổi mật khẩu
  changePassword(changePasswordDto: ChangePasswordDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, changePasswordDto).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy lịch sử đặt vé của người dùng
  getUserBookingHistory(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/bookings`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy thống kê người dùng
  getUserStats(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Lấy danh sách tất cả người dùng
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/all`).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Lấy người dùng theo ID
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/admin/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Cập nhật vai trò người dùng
  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${userId}/role`, { role }).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Kích hoạt/Vô hiệu hóa người dùng
  toggleUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${userId}/status`, { isActive }).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Xóa người dùng
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Lấy thống kê người dùng
  getUsersStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Tìm kiếm người dùng
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/search`, {
      params: { q: query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Quên mật khẩu
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // Reset mật khẩu
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  // Xác thực email
  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token }).pipe(
      catchError(this.handleError)
    );
  }

  // Gửi lại email xác thực
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email }).pipe(
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
          errorMessage = 'Dữ liệu người dùng không hợp lệ. Vui lòng kiểm tra lại.';
          break;
        case 401:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập.';
          break;
        case 404:
          errorMessage = 'Người dùng không tồn tại.';
          break;
        case 409:
          errorMessage = 'Email hoặc username đã tồn tại.';
          break;
        case 422:
          errorMessage = 'Mật khẩu hiện tại không đúng.';
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
