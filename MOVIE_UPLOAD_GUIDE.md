# Hướng dẫn Upload Ảnh Poster Phim

## Tổng quan
Hệ thống đã được cập nhật để hỗ trợ upload ảnh poster phim lên Cloudinary thông qua backend API.

## Cách hoạt động

### 1. Frontend (MovieManagement.tsx)
- Người dùng chọn file ảnh từ máy tính
- Frontend tạo preview ảnh ngay lập tức
- Khi submit form, file ảnh được gửi cùng với dữ liệu phim

### 2. Backend (MovieController.java)
- API `/api/movie/add` (POST) - Tạo phim mới
- API `/api/movie/{id}` (PUT) - Cập nhật phim
- Cả hai API đều nhận `@ModelAttribute MovieDTO` và `@RequestPart MultipartFile posterImg`
- Backend sử dụng `CloudinaryService` để upload ảnh lên Cloudinary
- URL ảnh từ Cloudinary được lưu vào database

### 3. CloudinaryService
- Upload ảnh lên Cloudinary với folder "Cinema"
- Tự động tạo public_id unique
- Kiểm tra định dạng file (jpg, jpeg, png, gif, bmp, ico, tiff, webp)
- Giới hạn kích thước file 5MB
- Trả về URL ảnh từ Cloudinary

## Cấu hình Cloudinary

### Backend (CloudinaryConfig.java)
```java
@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dp9ltogc9",
                "api_key", "587857755213897", 
                "api_secret", "o80O5e-0ZxH1jBmDWoJb_EovUBc",
                "secure", true));
    }
}
```

### CloudinaryService.java
- Đã được kích hoạt (`@Service`)
- Upload ảnh vào folder "Cinema"
- Tự động tạo public_id unique
- Kiểm tra định dạng và kích thước file

## API Endpoints

### 1. Tạo phim mới
```
POST /api/movie/add
Content-Type: multipart/form-data

Form Data:
- title: string
- description: string
- duration: number
- genre: string
- director: string
- language: string
- status: string
- price: number
- rating: number
- releaseDate: string (YYYY-MM-DD)
- trailerUrl: string
- cast: string
- filmRating: string (G, PG, PG-13, R, NC-17)
- posterImg: File (optional)
```

### 2. Cập nhật phim
```
PUT /api/movie/{id}
Content-Type: multipart/form-data

Form Data: (same as above)
```

## Frontend Features

### 1. File Upload UI
- Drag & drop interface
- File preview ngay khi chọn
- Loading state khi upload
- Validation định dạng file (image/*)
- Giới hạn kích thước 5MB

### 2. Form Validation
- Tất cả trường bắt buộc được validate
- Date format cho releaseDate
- Number validation cho duration, price, rating
- Select options cho status và filmRating

### 3. Error Handling
- Hiển thị lỗi upload
- Hiển thị lỗi validation
- Loading state trong quá trình xử lý

## Cách test

### 1. Truy cập Admin Panel
1. Đăng nhập với tài khoản admin
2. Vào "Quản lý phim" (Movie Management)
3. Click "Thêm phim mới"

### 2. Test Upload Ảnh
1. Điền đầy đủ thông tin phim
2. Click "Upload a file" hoặc drag & drop ảnh
3. Kiểm tra preview ảnh hiển thị
4. Click "Thêm mới"
5. Kiểm tra ảnh được lưu trong database

### 3. Test Cập nhật Phim
1. Click "Sửa" trên một phim
2. Chọn ảnh mới (optional)
3. Click "Cập nhật"
4. Kiểm tra ảnh mới được lưu

## Lưu ý

### 1. Cloudinary Configuration
- Cần cấu hình đúng cloud_name, api_key, api_secret
- Upload preset cần được tạo trên Cloudinary dashboard
- Folder "Cinema" sẽ được tạo tự động

### 2. File Validation
- Chỉ chấp nhận file ảnh: jpg, jpeg, png, gif, bmp, ico, tiff, webp
- Kích thước tối đa 5MB
- Nếu không chọn ảnh, posterUrl sẽ là "default-poster.jpg"

### 3. Database
- posterUrl được lưu dưới dạng URL từ Cloudinary
- Format: https://res.cloudinary.com/dp9ltogc9/image/upload/v[timestamp]/[public_id].[extension]

## Troubleshooting

### 1. Lỗi Upload
- Kiểm tra kết nối internet
- Kiểm tra cấu hình Cloudinary
- Kiểm tra định dạng và kích thước file

### 2. Lỗi Preview
- Kiểm tra file có phải ảnh không
- Kiểm tra browser support cho URL.createObjectURL

### 3. Lỗi Backend
- Kiểm tra CloudinaryService đã được kích hoạt
- Kiểm tra CloudinaryConfig đã được cấu hình
- Kiểm tra logs backend để xem chi tiết lỗi
