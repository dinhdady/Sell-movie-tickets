import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { Router } from '@angular/router';
import { NotificationService } from './notification';

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);
  let notificationService: NotificationService | null = null;
  try {
    notificationService = inject(NotificationService);
  } catch {}
  
  // Loại trừ các endpoint authentication - không cần token
  const isAuthEndpoint = req.url.includes('/api/auth/');
  // Nếu là auth endpoint, không thêm token
  if (isAuthEndpoint) {
    console.log('[AuthInterceptor] Public endpoint detected, skipping token:', req.url);
    return next(req);
  }
  
  // Lấy token từ localStorage
  const token = authService.getAccessToken();
  
  console.log('[AuthInterceptor] Request to:', req.url, 'Token exists:', !!token);
  
  if (token) {
    console.log('[AuthInterceptor] Adding token to request:', req.url);
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // Nếu lỗi 401 (Unauthorized) và không phải refresh-token
        if (error.status === 401 && !req.url.includes('/refresh-token')) {
          console.log('[AuthInterceptor] 401 error received');
          // Kiểm tra accessToken có hết hạn không trước khi refresh
          const currentAccessToken = authService.getAccessToken();
          let isTokenExpired = true;
          if (typeof currentAccessToken === 'string') {
            try {
              isTokenExpired = authService.isTokenExpired(currentAccessToken);
            } catch (e) {
              isTokenExpired = true;
            }
          } else {
            isTokenExpired = true;
          }
          if (!isTokenExpired) {
            // Nếu accessToken chưa hết hạn mà vẫn bị 401, chỉ thông báo lỗi, không logout
            console.log('[AuthInterceptor] Access token still valid but got 401. Show notification, do not logout.');
            if (notificationService) {
              notificationService.showError('Bạn không có quyền truy cập hoặc phiên đăng nhập không hợp lệ.');
            }
            return throwError(() => error);
          }
          // Nếu token đã hết hạn, mới thực hiện refresh
          if (isRefreshing) {
            // Nếu đang refresh, chờ token mới
            return refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(token => {
                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`
                  }
                });
                return next(newReq);
              })
            );
          }
          isRefreshing = true;
          refreshTokenSubject.next(null);
          const refreshToken = authService.getRefreshToken();
          if (refreshToken) {
            console.log('[AuthInterceptor] Token expired, attempting to refresh...');
            return authService.refreshToken(refreshToken).pipe(
              switchMap((response: any) => {
                isRefreshing = false;
                const newAccessToken = response?.object?.accessToken || response?.data?.accessToken || response?.accessToken;
                const newRefreshToken = response?.object?.refreshToken || response?.data?.refreshToken || response?.refreshToken || refreshToken;
                if (newAccessToken) {
                  authService.saveTokens(newAccessToken, newRefreshToken);
                  refreshTokenSubject.next(newAccessToken);
                  const newReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newAccessToken}`
                    }
                  });
                  console.log('[AuthInterceptor] Token refreshed, retrying request:', req.url);
                  return next(newReq);
                } else {
                  // Refresh thất bại, chỉ xóa token nếu refreshToken cũng hết hạn hoặc không hợp lệ
                  console.log('[AuthInterceptor] Token refresh failed - invalid response:', response);
                  if (authService.isTokenExpired(refreshToken)) {
                    authService.clearTokens();
                    if (notificationService) {
                      notificationService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    }
                  } else {
                    if (notificationService) {
                      notificationService.showError('Không thể xác thực phiên đăng nhập. Vui lòng thử lại.');
                    }
                  }
                  return throwError(() => error);
                }
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                console.log('[AuthInterceptor] Token refresh error:', refreshError);
                // Chỉ xóa token nếu refreshToken cũng hết hạn hoặc không hợp lệ
                if (authService.isTokenExpired(refreshToken)) {
                  authService.clearTokens();
                  if (notificationService) {
                    notificationService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                  }
                } else {
                  if (notificationService) {
                    notificationService.showError('Không thể xác thực phiên đăng nhập. Vui lòng thử lại.');
                  }
                }
                return throwError(() => refreshError);
              })
            );
          } else {
            // Không có refresh token, chỉ xóa token nếu accessToken cũng hết hạn
            isRefreshing = false;
            console.log('[AuthInterceptor] No refresh token available');
            if (authService.isTokenExpired(token)) {
              authService.clearTokens();
              if (notificationService) {
                notificationService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
              }
            } else {
              if (notificationService) {
                notificationService.showError('Không thể xác thực phiên đăng nhập. Vui lòng thử lại.');
              }
            }
            return throwError(() => error);
          }
        }
        // Các lỗi khác
        return throwError(() => error);
      })
    );
  }
  
  // Nếu không có token và không phải auth endpoint, gửi request bình thường
  console.log('[AuthInterceptor] No token found for request:', req.url);
  return next(req);
} 
