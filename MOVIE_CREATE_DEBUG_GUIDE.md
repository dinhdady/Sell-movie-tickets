# Hướng dẫn Debug Movie Creation

## 🔍 Vấn đề đã sửa:

### 1. **Backend Logging**
- Thêm logging chi tiết trong `MovieController.addNewMovie()`
- In ra tất cả form data nhận được
- Log poster file information

### 2. **MovieService.createMovie()**
- Thêm các trường bị thiếu: `director`, `trailerUrl`, `filmRating`
- Xử lý poster upload với null check
- Set default poster nếu không có file

### 3. **CloudinaryService.isImageFile()**
- Sửa logic ngược: `!isImageFile(file)` thay vì `isImageFile(file)`
- Sử dụng `file.getOriginalFilename()` thay vì `file.getName()`
- Thêm null check cho fileName

### 4. **Frontend Response Handling**
- Sửa response code từ '200' thành '201' cho create
- Thêm success messages
- Cải thiện error handling

## 🧪 Cách test:

### 1. **Kiểm tra Backend Logs**
Khi thêm phim, kiểm tra console backend:
```
[MovieController] Creating new movie
[MovieController] MovieDTO received: MovieDTO(...)
[MovieController] Poster file: filename.jpg
[MovieController] All form data:
  - title: 'Movie Title'
  - description: 'Description'
  - duration: 120
  - releaseDate: '2025-01-01'
  - genre: 'Action'
  - director: 'Director Name'
  - cast: 'Actor 1, Actor 2'
  - rating: 8.5
  - status: 'NOW_SHOWING'
  - filmRating: 'PG-13'
  - price: 100000.0
  - language: 'Tiếng Việt'
  - trailerUrl: 'https://youtube.com/watch?v=...'
[MovieController] Movie created successfully with ID: 1
```

### 2. **Test với Script**
```bash
node test-movie-create.js
```

### 3. **Test Frontend**
1. Đăng nhập admin
2. Vào Movie Management
3. Click "Thêm phim mới"
4. Điền đầy đủ thông tin
5. Chọn ảnh poster (optional)
6. Click "Thêm mới"
7. Kiểm tra success message

## 🐛 Debug Steps:

### 1. **Nếu không nhận đủ data:**
- Kiểm tra form data có đầy đủ không
- Kiểm tra Content-Type: multipart/form-data
- Kiểm tra field names có đúng không

### 2. **Nếu Cloudinary lỗi:**
- Kiểm tra CloudinaryConfig có đúng không
- Kiểm tra API keys
- Kiểm tra file format và size

### 3. **Nếu response code sai:**
- Create: 201 (Created)
- Update: 200 (OK)
- Error: 409 (Conflict) hoặc 400 (Bad Request)

## 📋 Checklist:

- [ ] Backend logs hiển thị đầy đủ data
- [ ] CloudinaryService hoạt động đúng
- [ ] MovieService set đủ các trường
- [ ] Frontend gửi đúng form data
- [ ] Response code đúng (201 cho create)
- [ ] Success message hiển thị
- [ ] Movie được thêm vào database
- [ ] Poster URL được lưu đúng

## 🔧 Common Issues:

### 1. **Form Data Missing**
```javascript
// Đảm bảo tất cả fields được append
Object.keys(movieData).forEach(key => {
  if (movieData[key] !== null && movieData[key] !== undefined) {
    formData.append(key, movieData[key]);
  }
});
```

### 2. **File Upload Issues**
```javascript
// Kiểm tra file có tồn tại không
if (posterFile) {
  formData.append('posterImg', posterFile);
}
```

### 3. **Response Code Mismatch**
```javascript
// Create: 201, Update: 200
if (response.state === '201' && response.object) {
  // Success
}
```

## 🚀 Next Steps:

1. Test với data thật
2. Kiểm tra poster upload
3. Verify database records
4. Test update functionality
5. Check error handling
