USE movietickets;

-- Xóa tất cả dữ liệu theo thứ tự đúng
DELETE FROM showtime_seat_bookings;
DELETE FROM tickets;
DELETE FROM orders;
DELETE FROM bookings;
DELETE FROM showtimes;
DELETE FROM seats;
DELETE FROM rooms;
DELETE FROM cinemas;
DELETE FROM movies;
DELETE FROM users WHERE role = 'USER';

-- Reset auto increment
ALTER TABLE movies AUTO_INCREMENT = 1;
ALTER TABLE cinemas AUTO_INCREMENT = 1;
ALTER TABLE rooms AUTO_INCREMENT = 1;
ALTER TABLE seats AUTO_INCREMENT = 1;
ALTER TABLE showtimes AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE showtime_seat_bookings AUTO_INCREMENT = 1;

-- Tạo admin user
INSERT IGNORE INTO users (id, username, email, password, full_name, role, is_active, created_at, updated_at)
VALUES ('admin-001', 'admin', 'admin@example.com', '.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Administrator', 'ADMIN', true, NOW(), NOW());

SELECT 'Database reset completed' as status;
