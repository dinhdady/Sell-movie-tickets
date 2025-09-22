# Tóm tắt vấn đề thanh toán và giải pháp

## 🔍 Vấn đề chính

**Frontend gửi showtimeId=6 nhưng database không có showtime ID 6**

### Nguyên nhân:
1. **URL parameter**: Frontend nhận `showtime=6` từ URL parameter
2. **Database không có**: Database chỉ có showtime ID 11-20, không có ID 6
3. **Logic sai**: Frontend vẫn truyền showtime ID 6 vào BookingForm dù không tìm thấy trong API

### Luồng lỗi:
```
URL: /booking/7?showtime=6
↓
Frontend lấy preselectedShowtimeId = "6"
↓
Gọi API showtimeAPI.getByMovieId(7)
↓
API trả về showtimes với ID 11-20
↓
Frontend tìm showtime.id === 6 → Không tìm thấy
↓
selectedShowtime = undefined
↓
Nhưng vẫn truyền showtime.id = 6 vào BookingForm
↓
Backend nhận showtimeId=6 → Lỗi "Showtime không hợp lệ"
```

## ✅ Giải pháp đã thực hiện

### 1. Sửa Frontend Logic
- **File**: `frontend/src/pages/Booking.tsx`
- **Thay đổi**: Thêm validation để chỉ auto-select showtime nếu tìm thấy trong API response
- **Code**:
```typescript
const selectedShowtime = showtimesResponse.object.find(st => st.id === parseInt(preselectedShowtimeId));
if (selectedShowtime) {
  console.log('✅ Found preselected showtime from API:', selectedShowtime);
  setSelectedShowtime(selectedShowtime);
  // ...
} else {
  console.log('❌ Preselected showtime ID', preselectedShowtimeId, 'not found in API response');
  console.log('Available showtime IDs:', showtimesResponse.object.map(st => st.id));
  setError('Suất chiếu đã chọn không còn tồn tại. Vui lòng chọn suất chiếu khác.');
}
```

### 2. Tạo Script Database
- **File**: `fix_showtime_6.sql`
- **Mục đích**: Tạo showtime ID 6 trong database nếu cần
- **SQL**:
```sql
INSERT INTO showtimes (id, movie_id, room_id, start_time, end_time, price, status, created_at, updated_at) 
VALUES (6, 7, 1, '2025-09-22 14:00:00', '2025-09-22 16:00:00', 120000, 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE ...;
```

## 🧪 Cách test

### 1. Chạy SQL script
```bash
mysql -u root -p < fix_showtime_6.sql
```

### 2. Test API
```bash
# Test showtime API
curl -X GET "http://localhost:8080/api/showtime" -H "Authorization: Bearer YOUR_TOKEN"

# Test order creation
curl -X POST "http://localhost:8080/api/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","showtimeId":6,"totalPrice":120000,"customerEmail":"test@example.com"}'
```

### 3. Test Frontend
1. Truy cập: `http://localhost:5173/booking/7?showtime=6`
2. Kiểm tra console log:
   - Nếu có showtime ID 6: "✅ Found preselected showtime from API"
   - Nếu không có: "❌ Preselected showtime ID 6 not found in API response"

## 🎯 Kết quả mong đợi

### Trước khi sửa:
- Frontend gửi showtimeId=6
- Backend trả về lỗi "Showtime không hợp lệ"
- Thanh toán thất bại

### Sau khi sửa:
- Frontend kiểm tra showtime ID có tồn tại trong API response
- Nếu có: Auto-select showtime đó
- Nếu không: Hiển thị lỗi và yêu cầu chọn showtime khác
- Thanh toán thành công với showtime ID hợp lệ

## 📝 Files đã thay đổi

1. `frontend/src/pages/Booking.tsx` - Sửa logic auto-select showtime
2. `fix_showtime_6.sql` - Script tạo showtime ID 6
3. `test-complete-booking-flow.ps1` - Script test toàn bộ luồng

## 🚀 Bước tiếp theo

1. **Chạy SQL script** để tạo showtime ID 6
2. **Restart backend** nếu cần
3. **Test frontend** với URL có showtime parameter
4. **Kiểm tra console log** để xác nhận logic hoạt động đúng
5. **Test thanh toán** để đảm bảo flow hoàn chỉnh
