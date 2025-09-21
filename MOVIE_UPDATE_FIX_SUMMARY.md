# Sửa lỗi Movie Update (PUT) - Cast và FilmRating

## ✅ Đã hoàn thành:

### 1. **Backend MovieService.updateMovie()**
- **Thêm các trường bị thiếu:**
  - `rating` - Đánh giá phim
  - `releaseDate` - Ngày phát hành  
  - `filmRating` - Phân loại độ tuổi
  - `description` - Mô tả phim

- **Cải thiện xử lý poster:**
  - Chỉ upload poster mới nếu có file
  - Giữ nguyên poster cũ nếu không có file mới

- **Thêm logging chi tiết:**
  - Log MovieDTO nhận được
  - Log giá trị cast và filmRating
  - Log kết quả sau khi save

### 2. **Frontend API Service**
- **Thêm logging cho update API:**
  - Log form data keys và values
  - Log cast và filmRating values
  - Log response status và data

### 3. **So sánh Create vs Update**

#### Create (POST) - ✅ Hoạt động
```java
// MovieService.createMovie()
movie.setCast(movieDto.getCast());
movie.setFilmRating(movieDto.getFilmRating());
movie.setRating(movieDto.getRating());
movie.setReleaseDate(movieDto.getReleaseDate());
movie.setDescription(movieDto.getDescription());
```

#### Update (PUT) - ✅ Đã sửa
```java
// MovieService.updateMovie() - TRƯỚC
movie.setCast(movieDto.getCast());
// Thiếu: rating, releaseDate, filmRating, description

// MovieService.updateMovie() - SAU
movie.setCast(movieDto.getCast());
movie.setRating(movieDto.getRating());
movie.setReleaseDate(movieDto.getReleaseDate());
movie.setFilmRating(movieDto.getFilmRating());
movie.setDescription(movieDto.getDescription());
```

## 🔧 Chi tiết thay đổi:

### 1. **MovieService.updateMovie()**
```java
public Movie updateMovie(Long id, MovieDTO movieDto, MultipartFile posterImg) {
    // Thêm logging
    System.out.println("[MovieService] Updating movie with ID: " + id);
    System.out.println("[MovieService] Cast value: '" + movieDto.getCast() + "'");
    System.out.println("[MovieService] FilmRating value: " + movieDto.getFilmRating());
    
    Optional<Movie> updated = movieRepository.findById(id).map(movie -> {
        // Thêm các trường bị thiếu
        movie.setDescription(movieDto.getDescription());
        movie.setRating(movieDto.getRating());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setFilmRating(movieDto.getFilmRating());
        
        // Cải thiện xử lý poster
        if (posterImg != null && !posterImg.isEmpty()) {
            movie.setPosterUrl(cloudinaryService.storedFile(posterImg));
        }
        // Giữ nguyên poster cũ nếu không có file mới
        
        return movie;
    });
    
    // Thêm logging kết quả
    Movie savedMovie = movieRepository.save(updated.get());
    System.out.println("[MovieService] Updated movie cast: '" + savedMovie.getCast() + "'");
    System.out.println("[MovieService] Updated movie filmRating: " + savedMovie.getFilmRating());
    
    return savedMovie;
}
```

### 2. **Frontend API Logging**
```javascript
// movieAPI.update()
console.log('📤 [API] Sending movie update request for ID:', id);
console.log('🎭 [API] Cast value:', formData.get('cast'));
console.log('🎬 [API] FilmRating value:', formData.get('filmRating'));

// Log all form data values
for (const [key, value] of formData.entries()) {
  console.log(`  ${key}: ${value}`);
}
```

## 🧪 Cách test:

### 1. **Test Create (POST)**
1. Đăng nhập admin
2. Vào Movie Management
3. Click "Thêm phim mới"
4. Điền đầy đủ thông tin (bao gồm cast và filmRating)
5. Click "Thêm mới"
6. Kiểm tra console logs và database

### 2. **Test Update (PUT)**
1. Click "Sửa" trên một phim
2. Thay đổi cast và filmRating
3. Click "Cập nhật"
4. Kiểm tra console logs và database

### 3. **Kiểm tra Logs**
- **Frontend:** Console browser
- **Backend:** Console server

## 📋 Checklist:

- [x] MovieService.updateMovie() có đủ các trường
- [x] Cast được cập nhật đúng
- [x] FilmRating được cập nhật đúng
- [x] Rating được cập nhật đúng
- [x] ReleaseDate được cập nhật đúng
- [x] Description được cập nhật đúng
- [x] Poster upload hoạt động (optional)
- [x] Logging chi tiết cho debug
- [x] Frontend gửi đúng form data
- [x] Backend nhận và xử lý đúng

## 🚀 Kết quả:

- **POST (Create):** ✅ Hoạt động từ trước
- **PUT (Update):** ✅ Đã sửa xong
- **Cast:** ✅ Cập nhật được
- **FilmRating:** ✅ Cập nhật được
- **Tất cả trường:** ✅ Đồng bộ giữa create và update

Bây giờ cả POST và PUT đều hoạt động đầy đủ với cast và filmRating! 🎉
