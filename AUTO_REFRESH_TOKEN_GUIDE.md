# Auto Refresh Token Implementation Guide

## ✅ Đã hoàn thành:

### 1. **Token Service (`frontend/src/services/tokenService.ts`)**
- **Refresh Access Token:** Tự động refresh token khi hết hạn
- **Token Expiration Check:** Kiểm tra token có hết hạn không
- **Concurrent Request Handling:** Tránh multiple refresh requests cùng lúc
- **Token Management:** Quản lý access token và refresh token

### 2. **API Interceptor (`frontend/src/services/api.ts`)**
- **Auto Retry on 401:** Tự động retry request khi gặp 401 Unauthorized
- **Token Refresh Integration:** Tích hợp với tokenService để refresh token
- **Request Queue Management:** Đảm bảo chỉ có 1 refresh request tại một thời điểm

### 3. **Auth Context (`frontend/src/contexts/AuthContext.tsx`)**
- **Initialization Check:** Kiểm tra token hết hạn khi khởi tạo app
- **Auto Refresh Timer:** Tự động refresh token mỗi 10 phút
- **Error Handling:** Xử lý lỗi khi refresh token thất bại

## 🔧 Chi tiết Implementation:

### 1. **Token Service Features**

```typescript
class TokenService {
  // Refresh access token với retry logic
  async refreshAccessToken(): Promise<string>
  
  // Kiểm tra token hết hạn
  isTokenExpired(token: string): boolean
  
  // Lấy access token hiện tại
  getAccessToken(): string | null
  
  // Lấy refresh token hiện tại
  getRefreshToken(): string | null
  
  // Xóa tất cả tokens
  clearTokens(): void
  
  // Kiểm tra có tokens hợp lệ không
  hasValidTokens(): boolean
}
```

### 2. **API Interceptor Logic**

```typescript
// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await tokenService.refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 3. **Auth Context Auto Refresh**

```typescript
// Auto refresh token every 10 minutes
useEffect(() => {
  if (!user || !token) return;

  const refreshInterval = setInterval(async () => {
    try {
      const newToken = await tokenService.refreshAccessToken();
      setToken(newToken);
    } catch (error) {
      // Don't logout immediately, let the next API call handle it
    }
  }, 10 * 60 * 1000); // 10 minutes

  return () => clearInterval(refreshInterval);
}, [user, token]);
```

## 🚀 Cách hoạt động:

### 1. **Khi App khởi động:**
1. Kiểm tra token trong localStorage
2. Nếu token hết hạn → Tự động refresh
3. Nếu refresh thành công → Cập nhật token mới
4. Nếu refresh thất bại → Logout user

### 2. **Khi API call gặp 401:**
1. Interceptor bắt lỗi 401
2. Gọi `tokenService.refreshAccessToken()`
3. Cập nhật Authorization header với token mới
4. Retry request gốc với token mới
5. Nếu refresh thất bại → Redirect to login

### 3. **Auto refresh định kỳ:**
1. Mỗi 10 phút kiểm tra và refresh token
2. Cập nhật token trong localStorage
3. Cập nhật token trong AuthContext state

## 📋 Backend API Endpoints:

### **Refresh Token Endpoint:**
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

### **Response:**
```json
{
  "state": "SUCCESS",
  "message": "Token refreshed successfully",
  "object": {
    "success": true,
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "message": "Success"
  }
}
```

## 🧪 Testing:

### 1. **Test Token Expiration:**
1. Đăng nhập vào app
2. Chờ token hết hạn (hoặc manually expire)
3. Thực hiện API call
4. Kiểm tra console logs để xem auto refresh

### 2. **Test Auto Refresh Timer:**
1. Đăng nhập vào app
2. Mở console và chờ 10 phút
3. Kiểm tra logs: "Auto refreshing token..."

### 3. **Test Concurrent Requests:**
1. Đăng nhập vào app
2. Thực hiện nhiều API calls cùng lúc khi token hết hạn
3. Kiểm tra chỉ có 1 refresh request được gửi

## 🔒 Security Features:

### 1. **Token Rotation:**
- Mỗi lần refresh, cả access token và refresh token đều được cập nhật
- Refresh token cũ bị revoke

### 2. **Concurrent Protection:**
- Chỉ có 1 refresh request tại một thời điểm
- Các requests khác chờ refresh hoàn thành

### 3. **Error Handling:**
- Refresh thất bại → Clear tokens và logout
- Không retry vô hạn

### 4. **Automatic Cleanup:**
- Clear tokens khi logout
- Clear tokens khi refresh thất bại

## 📊 Console Logs:

### **Successful Refresh:**
```
🔄 [TokenService] Refreshing access token...
✅ [TokenService] Token refreshed successfully
🔄 [API] Token expired, attempting to refresh...
✅ [API] Token refreshed, retrying original request...
```

### **Auto Refresh:**
```
🔄 [AuthContext] Auto refreshing token...
✅ [AuthContext] Token auto-refreshed successfully
```

### **Failed Refresh:**
```
❌ [TokenService] Token refresh failed: [error details]
❌ [API] Token refresh failed: [error details]
```

## 🎯 Benefits:

1. **Seamless User Experience:** User không bị logout đột ngột
2. **Automatic Token Management:** Không cần manual refresh
3. **Concurrent Request Safety:** Tránh multiple refresh requests
4. **Error Recovery:** Graceful handling khi refresh thất bại
5. **Security:** Token rotation và proper cleanup

## 🚀 Kết quả:

- **Auto Refresh Token:** ✅ Hoàn thành
- **API Interceptor:** ✅ Hoàn thành  
- **Auth Context Integration:** ✅ Hoàn thành
- **Error Handling:** ✅ Hoàn thành
- **Security Features:** ✅ Hoàn thành

Bây giờ app sẽ tự động refresh token khi hết hạn và user không bị logout đột ngột! 🎉
