# Script nhanh để sửa lỗi Movie reference
Write-Host "🚀 Quick fix for Movie reference error..." -ForegroundColor Yellow

# Tạo movie ID 1 nếu không tồn tại
$createMovieSQL = @"
-- Tạo movie ID 1 nếu không tồn tại
INSERT IGNORE INTO movies (id, title, description, director, duration, genre, language, film_rating, price, rating, release_date, status, created_at, updated_at)
VALUES (1, 'Movie Placeholder', 'This is a placeholder movie for fixing reference errors', 'Unknown Director', 120, 'Action', 'Vietnamese', 'PG13', 50000, 7.0, '2024-01-01', 'NOW_SHOWING', NOW(), NOW());

-- Kiểm tra kết quả
SELECT 'Movie ID 1 created:' as info, id, title, status FROM movies WHERE id = 1;
"@

# Lưu script
$createMovieSQL | Out-File -FilePath "quick_create_movie.sql" -Encoding UTF8

Write-Host "📝 Created quick fix script: quick_create_movie.sql" -ForegroundColor Green

# Tạo script để xóa tất cả dữ liệu và bắt đầu lại
$resetDataSQL = @"
-- Xóa tất cả dữ liệu theo thứ tự đúng (từ bảng con đến bảng cha)
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

-- Tạo admin user nếu chưa có
INSERT IGNORE INTO users (id, username, email, password, full_name, role, is_active, created_at, updated_at)
VALUES ('admin-001', 'admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Administrator', 'ADMIN', true, NOW(), NOW());

SELECT 'Database reset completed' as status;
"@

$resetDataSQL | Out-File -FilePath "reset_database.sql" -Encoding UTF8

Write-Host "📝 Created reset script: reset_database.sql" -ForegroundColor Green

Write-Host "`n🔧 Choose your fix method:" -ForegroundColor Blue
Write-Host "1. Quick fix - Create movie ID 1:" -ForegroundColor White
Write-Host "   mysql -u root -p < quick_create_movie.sql" -ForegroundColor Cyan
Write-Host "`n2. Complete reset - Delete all data and start fresh:" -ForegroundColor White
Write-Host "   mysql -u root -p < reset_database.sql" -ForegroundColor Cyan
Write-Host "   Then restart the application to seed data" -ForegroundColor Cyan

Write-Host "`n⚠️  Recommendation:" -ForegroundColor Yellow
Write-Host "If you have important data, use method 1 (quick fix)" -ForegroundColor White
Write-Host "If you want a clean start, use method 2 (complete reset)" -ForegroundColor White

Write-Host "`n🌐 After fixing, test at: http://localhost:5173" -ForegroundColor Blue

Write-Host "`n🏁 Scripts ready for execution" -ForegroundColor Green
