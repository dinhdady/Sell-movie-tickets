# Admin Panel - Cinema Booking System

## Tổng quan
Admin Panel là giao diện quản lý dành cho quản trị viên của hệ thống đặt vé xem phim. Chỉ những người dùng có role `ADMIN` mới có thể truy cập.

## Các trang chính

### 1. Dashboard (`/admin`)
- **Mục đích**: Trang tổng quan với các thống kê chính
- **Tính năng**:
  - Hiển thị tổng số đặt vé, phim, người dùng, doanh thu
  - Thống kê hôm nay (đặt vé, doanh thu)
  - Thao tác nhanh đến các trang quản lý
  - Biểu đồ và xu hướng tăng trưởng

### 2. Quản lý phim (`/admin/movies`)
- **Mục đích**: CRUD cho danh sách phim
- **Tính năng**:
  - Xem danh sách phim với bộ lọc (tên, đạo diễn, thể loại, trạng thái)
  - Thêm phim mới với đầy đủ thông tin
  - Chỉnh sửa thông tin phim
  - Xóa phim
  - Quản lý trạng thái phim (Đang chiếu, Sắp chiếu, Ngừng chiếu)

### 3. Quản lý đặt vé (`/admin/bookings`)
- **Mục đích**: Quản lý và theo dõi các đơn đặt vé
- **Tính năng**:
  - Xem danh sách đặt vé với bộ lọc
  - Xem chi tiết đặt vé
  - Thay đổi trạng thái đặt vé (Chờ xác nhận, Đã xác nhận, Đã hủy)
  - Thống kê đặt vé theo ngày
  - Quản lý thanh toán

### 4. Quản lý người dùng (`/admin/users`)
- **Mục đích**: Quản lý tài khoản người dùng
- **Tính năng**:
  - Xem danh sách người dùng
  - Thêm/sửa/xóa người dùng
  - Thay đổi role (USER/ADMIN)
  - Quản lý trạng thái tài khoản
  - Thống kê người dùng

### 5. Quản lý rạp chiếu (`/admin/cinemas`)
- **Mục đích**: Quản lý các rạp chiếu phim
- **Tính năng**:
  - Xem danh sách rạp chiếu
  - Thêm/sửa/xóa rạp chiếu
  - Quản lý phòng chiếu trong rạp
  - Quản lý loại rạp (Tiêu chuẩn, Cao cấp, Sang trọng)
  - Thống kê rạp chiếu

### 6. Thống kê (`/admin/statistics`)
- **Mục đích**: Báo cáo và phân tích dữ liệu
- **Tính năng**:
  - Thống kê tổng quan
  - Top phim bán chạy
  - Top rạp chiếu
  - Biểu đồ doanh thu
  - Xu hướng tăng trưởng
  - Báo cáo theo thời gian

### 7. Cài đặt (`/admin/settings`)
- **Mục đích**: Cấu hình hệ thống
- **Tính năng**:
  - Cài đặt chung (tên website, múi giờ, ngôn ngữ)
  - Cài đặt thông báo (email, SMS)
  - Cài đặt bảo mật (2FA, session timeout)
  - Cài đặt thanh toán (VNPay)
  - Cài đặt hệ thống (maintenance mode, debug)

## Bảo mật

### ProtectedAdminRoute
- Kiểm tra xác thực người dùng
- Kiểm tra role ADMIN
- Redirect về trang đăng nhập nếu chưa xác thực
- Hiển thị thông báo lỗi nếu không có quyền

### Navigation
- Admin link chỉ hiển thị cho user có role ADMIN
- Responsive design cho mobile và desktop
- Sidebar navigation với active state

## Công nghệ sử dụng

- **React 18** với TypeScript
- **React Router v6** cho routing
- **Tailwind CSS** cho styling
- **Heroicons** cho icons
- **Context API** cho state management
- **Axios** cho API calls

## Cấu trúc thư mục

```
frontend/src/
├── components/
│   ├── AdminLayout.tsx          # Layout chính cho admin
│   └── ProtectedAdminRoute.tsx  # Bảo vệ route admin
├── pages/admin/
│   ├── Dashboard.tsx            # Trang dashboard
│   ├── MovieManagement.tsx      # Quản lý phim
│   ├── BookingManagement.tsx    # Quản lý đặt vé
│   ├── UserManagement.tsx       # Quản lý người dùng
│   ├── CinemaManagement.tsx     # Quản lý rạp chiếu
│   ├── Statistics.tsx           # Thống kê
│   ├── Settings.tsx             # Cài đặt
│   └── README.md               # Tài liệu này
└── contexts/
    └── AuthContext.tsx          # Context xác thực
```

## Hướng dẫn sử dụng

1. **Đăng nhập với tài khoản ADMIN**
2. **Truy cập `/admin`** để vào admin panel
3. **Sử dụng sidebar** để điều hướng giữa các trang
4. **Mỗi trang có các tính năng CRUD** cơ bản
5. **Sử dụng bộ lọc và tìm kiếm** để quản lý dữ liệu hiệu quả

## Lưu ý

- Tất cả các trang admin đều được bảo vệ bởi `ProtectedAdminRoute`
- Dữ liệu hiện tại là mock data, cần tích hợp với API thực tế
- Responsive design hỗ trợ mobile và desktop
- Có thể mở rộng thêm các tính năng khác theo nhu cầu
