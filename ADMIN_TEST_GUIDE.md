# Hướng dẫn Test Admin Panel

## 🎯 Mục đích
Test việc điều hướng đến trang dashboard sau khi xác thực role admin.

## 🔐 Tài khoản Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@cinema.com`
- **Role**: `ADMIN`

## 🧪 Các bước test

### 1. Test đăng nhập Admin
1. Truy cập `http://localhost:3000/login`
2. Nhập thông tin:
   - Username: `admin`
   - Password: `admin123`
3. Click "Đăng nhập"
4. **Kết quả mong đợi**: 
   - Đăng nhập thành công
   - Thấy nút "Admin" màu tím trong header
   - Console hiển thị logs về role checking

### 2. Test truy cập Admin Panel
1. Click nút "Admin" trong header
2. **Kết quả mong đợi**:
   - Điều hướng đến `/admin`
   - Hiển thị Admin Layout với sidebar
   - Dashboard được hiển thị làm trang mặc định
   - Thấy thông báo chào mừng: "Chào mừng trở lại, admin!"

### 3. Test Console Logs
Mở Developer Tools (F12) và kiểm tra console logs:

```
🔐 [PROTECTED_ADMIN] Checking access...
🔐 [PROTECTED_ADMIN] Loading: false
🔐 [PROTECTED_ADMIN] User: {id: "...", username: "admin", role: "ADMIN", ...}
🔐 [PROTECTED_ADMIN] User role: ADMIN
🔐 [PROTECTED_ADMIN] Role type: string
🔐 [PROTECTED_ADMIN] Is admin: true
🔐 [PROTECTED_ADMIN] Access granted!
🏠 [ADMIN_LAYOUT] Current path: /admin
🏠 [ADMIN_LAYOUT] User role: ADMIN
📊 [DASHBOARD] Component rendered
```

### 4. Test Navigation
1. Click các menu items trong sidebar:
   - Dashboard → `/admin` (trang hiện tại)
   - Phim → `/admin/movies`
   - Đặt vé → `/admin/bookings`
   - Người dùng → `/admin/users`
   - Rạp chiếu → `/admin/cinemas`
   - Thống kê → `/admin/statistics`
   - Cài đặt → `/admin/settings`

### 5. Test với User thường
1. Đăng xuất admin
2. Đăng nhập với user thường
3. **Kết quả mong đợi**:
   - Không thấy nút "Admin" trong header
   - Truy cập `/admin` trực tiếp sẽ thấy thông báo "Không có quyền truy cập"

## 🐛 Debug Information

### Nếu không thấy nút Admin:
- Kiểm tra console logs về role
- Đảm bảo user có role "ADMIN"
- Kiểm tra AuthContext có lưu user đúng không

### Nếu không thể truy cập /admin:
- Kiểm tra ProtectedAdminRoute logs
- Đảm bảo role được xử lý đúng (case-insensitive)
- Kiểm tra user object trong localStorage

### Nếu Dashboard không hiển thị:
- Kiểm tra AdminLayout logs
- Đảm bảo routing được cấu hình đúng
- Kiểm tra Dashboard component có render không

## ✅ Kết quả mong đợi

Sau khi hoàn thành test, bạn sẽ thấy:

1. **Đăng nhập admin thành công**
2. **Nút Admin xuất hiện trong header**
3. **Truy cập /admin hiển thị dashboard**
4. **Thông báo chào mừng admin**
5. **Sidebar navigation hoạt động**
6. **Console logs chi tiết**

## 🔧 Troubleshooting

Nếu gặp vấn đề, hãy kiểm tra:

1. **Backend đang chạy** trên port 8080
2. **Frontend đang chạy** trên port 3000
3. **Admin user đã được tạo** thành công
4. **Console không có lỗi** JavaScript
5. **Network tab** không có lỗi API

## 📝 Notes

- Tất cả logs đều có prefix để dễ debug
- Role checking là case-insensitive
- Có fallback cho các trường hợp role khác nhau
- UI responsive cho mobile và desktop
