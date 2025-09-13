import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthRequest, RegisterRequest, AuthenticationResponse } from '../models/user';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private authStateService: AuthStateService
  ) { }

  // Đăng nhập
  login(authRequest: AuthRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, authRequest).pipe(
      map((response: any) => {
        // Lưu token và user info nếu có
        if (response && response.accessToken && response.refreshToken) {
          this.saveTokens(response.accessToken, response.refreshToken);
        }
        if (response && response.user) {
          localStorage.setItem('userInfo', JSON.stringify(response.user));
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Đăng ký
  register(registerRequest: RegisterRequest): Observable<any> {
    console.log('AuthService: Sending register request to:', `${this.apiUrl}/register`);
    console.log('AuthService: Request data:', registerRequest);
    
    return this.http.post(`${this.apiUrl}/register`, registerRequest).pipe(
      map(response => {
        console.log('AuthService: Raw response received:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Quên mật khẩu
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // Đặt lại mật khẩu
  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
      confirmPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Đăng xuất
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Refresh token
  refreshToken(refreshToken: string): Observable<any> {
    console.log('[AuthService] Refreshing token...');
    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      map((response: any) => {
        console.log('[AuthService] Refresh token response:', response);
        if (response && response.accessToken && response.refreshToken) {
          this.saveTokens(response.accessToken, response.refreshToken);
        }
        if (response && response.user) {
          localStorage.setItem('userInfo', JSON.stringify(response.user));
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Validate reset token
  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-reset-token?token=${token}`).pipe(
      catchError(this.handleError)
    );
  }

  // Kiểm tra token có hết hạn chưa
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
      console.warn('[AuthService] Token decode failed or missing exp, fallback to NOT expired');
      return false;
    }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Kiểm tra access token có hết hạn chưa
  isAccessTokenExpired(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return true;
    }
    return this.isTokenExpired(accessToken);
  }

  // Kiểm tra refresh token có hết hạn chưa
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return true;
    }
    return this.isTokenExpired(refreshToken);
  }

  // Xử lý lỗi từ backend
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi kết nối: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
        if (error.url && error.url.includes('/refresh-token')) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.url && error.url.includes('/login')) {
            // Chỉ hiển thị thông báo lỗi đăng nhập cho endpoint /login
            const backendMessage = error.error?.message || '';
            errorMessage = backendMessage.includes('credentials') ? 
                'Tên đăng nhập hoặc mật khẩu không chính xác' : 
                (backendMessage || 'Unauthorized');
        } else {
            errorMessage = error.error?.message || 'Unauthorized';
        }
        break;
        case 400:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
          }
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập.';
          break;
        case 404:
          errorMessage = 'Tài nguyên không tồn tại.';
          break;
        case 409:
          if (error.error?.message?.includes('username') || 
              error.error?.message?.includes('email')) {
            errorMessage = 'Tên đăng nhập hoặc email đã tồn tại.';
          } else {
            errorMessage = 'Dữ liệu đã tồn tại.';
          }
          break;
        case 422:
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
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

    console.log('AuthService handleError - Status:', error.status, 'Error:', error.error, 'Message:', errorMessage);

    return throwError(() => ({
      status: 'ERROR',
      message: errorMessage,
      originalError: error
    }));
  }

  // Lưu token vào localStorage
  saveTokens(accessToken: string, refreshToken: string): void {
    console.log('[AuthService] Saving access token:', accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('loginTime', Date.now().toString());
    console.log('[AuthService] Tokens saved to localStorage:', { accessToken, refreshToken });
    
    // Notify auth state service
    this.authStateService.notifyLogin();
  }

  // Lấy access token
  getAccessToken(): string | null {
    const token = localStorage.getItem('accessToken');
    console.log('[AuthService] Retrieved access token from localStorage:', token);
    return token;
  }

  // Lấy refresh token
  getRefreshToken(): string | null {
    const token = localStorage.getItem('refreshToken');
    console.log('[AuthService] Retrieved refresh token from localStorage:', token);
    return token;
  }

  // Xóa tokens
  clearTokens(): void {
  console.warn('[AuthService] clearTokens CALLED!');
  console.warn('[AuthService] accessToken before clear:', localStorage.getItem('accessToken'));
  console.warn('[AuthService] refreshToken before clear:', localStorage.getItem('refreshToken'));
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('userInfo');
  console.log('[AuthService] Tokens and userInfo cleared from localStorage');
  // Notify auth state service
  this.authStateService.notifyLogout();
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return false;
    }
    
    // Kiểm tra token có hết hạn không
    if (this.isTokenExpired(accessToken)) {
      console.log('[AuthService] Access token is expired');
      return false;
    }
    
    return true;
  }

  // Decode JWT token để lấy thông tin
  decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('decodeToken failed:', e);
    return null;
  }
}

  // Lấy role từ JWT token
  getUserRole(): string | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;
    
    const decoded = this.decodeToken(accessToken);
    return decoded?.role || null;
  }

  // Kiểm tra user có phải admin không
  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ROLE_ADMIN' || role === 'ADMIN';
  }

  // Kiểm tra và refresh token nếu cần thiết trước khi thực hiện chức năng admin
  async checkAndRefreshToken(): Promise<boolean> {
  console.log('[AuthService] Checking and refreshing token if needed...');
  
  const accessToken = this.getAccessToken();
  const refreshToken = this.getRefreshToken();
  
  // Nếu không có token nào, return false
  if (!accessToken || !refreshToken) {
    console.log('[AuthService] No tokens available');
    return false;
  }
  
  // Kiểm tra access token có hết hạn không
  const isExpired = this.isTokenExpired(accessToken);
  
  if (!isExpired) {
    console.log('[AuthService] Access token is still valid');
    return true;
  }
  
  console.log('[AuthService] Access token is expired, attempting to refresh...');
  
  try {
    const response: any = await this.refreshToken(refreshToken).toPromise();
    
    if (response.data && response.data.accessToken) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken || refreshToken);
      console.log('[AuthService] Token refreshed successfully');
      return true;
    } else {
      console.log('[AuthService] Token refresh failed - invalid response');
      return false; // Không clear tokens ở đây
    }
  } catch (error) {
    console.error('[AuthService] Token refresh error:', error);
    return false; // Không clear tokens ở đây
  }
}

  // Kiểm tra quyền admin với token validation
  async isAdminWithValidToken(): Promise<boolean> {
    console.log('[AuthService] Checking admin role with valid token...');
    
    // Kiểm tra và refresh token nếu cần
    const tokenValid = await this.checkAndRefreshToken();
    if (!tokenValid) {
      console.log('[AuthService] Token validation failed');
      return false;
    }
    
    // Kiểm tra role admin
    const isAdmin = this.isAdmin();
    console.log('[AuthService] Is admin:', isAdmin);
    return isAdmin;
  }

  // Kiểm tra đã đăng nhập với token validation
  async isLoggedInWithValidToken(): Promise<boolean> {
    console.log('[AuthService] Checking login status with valid token...');
    
    // Kiểm tra và refresh token nếu cần
    const tokenValid = await this.checkAndRefreshToken();
    if (!tokenValid) {
      console.log('[AuthService] Token validation failed');
      return false;
    }
    
    return true;
  }

  // Helper method để validate admin access và redirect nếu cần
  async validateAdminAccess(router: any, notificationService: any): Promise<boolean> {
    const isAdmin = await this.isAdminWithValidToken();
    if (!isAdmin) {
      notificationService.showError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập');
      this.clearTokens();
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  // Helper method để validate login status và redirect nếu cần
  async validateLoginAccess(router: any, notificationService: any): Promise<boolean> {
    const isLoggedIn = await this.isLoggedInWithValidToken();
    if (!isLoggedIn) {
      notificationService.showError('Vui lòng đăng nhập để truy cập trang này');
      this.clearTokens();
      router.navigate(['/']);
      return false;
    }
    return true;
  }
}
