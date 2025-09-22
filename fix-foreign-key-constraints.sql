-- Script để xử lý lỗi foreign key constraint
-- Chạy script này trong MySQL để xóa dữ liệu an toàn

-- 1. Xóa tất cả ShowtimeSeatBooking trước
DELETE FROM showtime_seat_bookings;

-- 2. Xóa tất cả Bookings
DELETE FROM bookings;

-- 3. Xóa tất cả Orders
DELETE FROM orders;

-- 4. Xóa tất cả Tickets
DELETE FROM tickets;

-- 5. Bây giờ có thể xóa Showtimes
DELETE FROM showtimes;

-- 6. Xóa Movies (nếu cần)
-- DELETE FROM movies;

-- 7. Xóa Rooms (nếu cần)
-- DELETE FROM rooms;

-- 8. Xóa Cinemas (nếu cần)
-- DELETE FROM cinemas;

-- 9. Reset auto increment
ALTER TABLE showtime_seat_bookings AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE showtimes AUTO_INCREMENT = 1;
ALTER TABLE movies AUTO_INCREMENT = 1;
ALTER TABLE rooms AUTO_INCREMENT = 1;
ALTER TABLE cinemas AUTO_INCREMENT = 1;

-- 10. Kiểm tra dữ liệu
SELECT 'showtime_seat_bookings' as table_name, COUNT(*) as count FROM showtime_seat_bookings
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'showtimes', COUNT(*) FROM showtimes
UNION ALL
SELECT 'movies', COUNT(*) FROM movies
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'cinemas', COUNT(*) FROM cinemas;
