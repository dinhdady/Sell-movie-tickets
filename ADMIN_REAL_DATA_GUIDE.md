# Hướng dẫn Test Admin Panel với Dữ liệu Thật

## 🎯 Mục đích
Test admin panel với dữ liệu thật từ backend thay vì mock data.

## 🔧 Cấu hình Backend
Đảm bảo backend đang chạy trên port 8080:
```bash
cd src/main/java/com/project/cinema/movie
mvn spring-boot:run
```

## 🚀 Cấu hình Frontend
Chạy frontend trên port 3000:
```bash
cd frontend
npm run dev
```

## 📊 API Endpoints đã được tích hợp

### ✅ **Dashboard API**
- **Endpoint**: `/api/dashboard/overview`
- **Method**: GET
- **Auth**: Required (ADMIN role)
- **Status**: ✅ Integrated với fallback

### ✅ **User Management API**
- **Endpoints**:
  - `GET /api/user/admin/all` - Lấy tất cả users
  - `GET /api/user/admin/{userId}` - Lấy user theo ID
  - `PUT /api/user/admin/{userId}/role` - Cập nhật role
  - `PUT /api/user/admin/{userId}/status` - Toggle status
  - `DELETE /api/user/admin/{userId}` - Xóa user
  - `GET /api/user/admin/search?q={query}` - Tìm kiếm users
- **Auth**: Required (ADMIN role)
- **Status**: ✅ Integrated

### ✅ **Movie Management API**
- **Endpoints**:
  - `GET /api/movie?page=0&size=10` - Lấy danh sách phim (có phân trang)
  - `GET /api/movie/{id}` - Lấy phim theo ID
  - `POST /api/movie/add` - Thêm phim mới
  - `PUT /api/movie/{id}` - Cập nhật phim
  - `DELETE /api/movie/{id}` - Xóa phim
- **Auth**: Một số endpoint cần ADMIN role
- **Status**: ✅ Integrated

### ✅ **Booking Management API**
- **Endpoints**:
  - `GET /api/booking` - Lấy tất cả bookings
  - `GET /api/booking/{id}` - Lấy booking theo ID
  - `PUT /api/booking/{id}` - Cập nhật booking
  - `DELETE /api/booking/{id}` - Xóa booking
- **Auth**: Một số endpoint cần ADMIN role
- **Status**: ✅ Integrated

### ✅ **Cinema Management API**
- **Endpoints**:
  - `GET /api/cinema` - Lấy tất cả rạp chiếu
  - `GET /api/cinema/{id}` - Lấy rạp theo ID
  - `POST /api/cinema` - Thêm rạp mới
  - `PUT /api/cinema/{id}` - Cập nhật rạp
  - `DELETE /api/cinema/{id}` - Xóa rạp
- **Auth**: Một số endpoint cần ADMIN role
- **Status**: ✅ Integrated

### ✅ **Statistics API**
- **Endpoints**:
  - `GET /api/dashboard/revenue-stats` - Thống kê doanh thu
  - `GET /api/dashboard/booking-stats` - Thống kê đặt vé
- **Auth**: Required (ADMIN role)
- **Status**: ✅ Integrated với fallback

## 🧪 Cách Test

### 1. **Test Authentication**
```bash
# Tạo admin user (nếu chưa có)
curl -X POST http://localhost:8080/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@cinema.com"}'
```

### 2. **Test Frontend**
1. Truy cập `http://localhost:3000`
2. Đăng nhập với admin account
3. Click "Admin" trong header
4. Kiểm tra các trang admin:

#### **Dashboard**
- Sẽ hiển thị dữ liệu thật từ `/api/dashboard/overview`
- Nếu API không khả dụng, sẽ fallback về individual APIs
- Hiển thị: tổng bookings, movies, users, revenue

#### **Movie Management**
- Hiển thị danh sách phim thật từ database
- Có thể thêm, sửa, xóa phim
- Phân trang hoạt động

#### **User Management**
- Hiển thị danh sách users thật
- Có thể cập nhật role, toggle status, xóa user
- Tìm kiếm users

#### **Cinema Management**
- Hiển thị danh sách rạp chiếu thật
- CRUD operations cho cinemas

#### **Booking Management**
- Hiển thị danh sách bookings thật
- Có thể cập nhật status, xem chi tiết

#### **Statistics**
- Hiển thị thống kê dựa trên dữ liệu thật
- Charts và graphs với dữ liệu real-time

## 🔍 Debug Information

### **Console Logs**
Mở Developer Tools (F12) để xem logs:
```
📊 [DASHBOARD] Component rendered
🏠 [ADMIN_LAYOUT] Current path: /admin
🔐 [PROTECTED_ADMIN] Checking access...
```

### **Network Tab**
Kiểm tra Network tab để xem API calls:
- `GET /api/dashboard/overview`
- `GET /api/user/admin/all`
- `GET /api/movie?page=0&size=10`
- `GET /api/booking`
- `GET /api/cinema`

### **API Response Format**
```json
{
  "state": "200",
  "message": "Success message",
  "object": { /* data */ }
}
```

## ⚠️ Lưu ý

### **Authentication Required**
- Dashboard, User Management, Statistics cần ADMIN role
- Đảm bảo đăng nhập với admin account

### **Fallback Mechanism**
- Nếu Dashboard API không khả dụng, sẽ fallback về individual APIs
- Nếu một API fail, sẽ hiển thị error message

### **Error Handling**
- Tất cả API calls đều có error handling
- Hiển thị loading states
- Error messages trong console

## 🎉 Kết quả mong đợi

Sau khi hoàn thành test, bạn sẽ thấy:

1. **Dashboard hiển thị dữ liệu thật** từ database
2. **Movie Management** với CRUD operations hoạt động
3. **User Management** với quản lý users thật
4. **Cinema Management** với dữ liệu rạp chiếu thật
5. **Booking Management** với danh sách bookings thật
6. **Statistics** với charts dựa trên dữ liệu thật

## 🚀 Next Steps

1. **Thêm pagination** cho các trang admin
2. **Thêm filtering và sorting**
3. **Thêm export functionality**
4. **Thêm real-time updates**
5. **Thêm advanced analytics**

## 📝 Notes

- Tất cả API calls đều có proper error handling
- Loading states được hiển thị trong khi fetch data
- Fallback mechanisms đảm bảo app không crash
- TypeScript types được định nghĩa đúng
- Responsive design cho mobile và desktop
