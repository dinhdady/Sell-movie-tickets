# Script đơn giản để sửa lỗi Movie reference
Write-Host "🔧 Simple fix for Movie reference error..." -ForegroundColor Yellow

# Tạo script SQL đơn giản
$simpleSQL = @"
USE movietickets;

-- Tạo movie ID 1 nếu không tồn tại
INSERT IGNORE INTO movies (id, title, description, director, duration, genre, language, film_rating, price, rating, release_date, status, created_at, updated_at)
VALUES (1, 'Movie Placeholder', 'This is a placeholder movie for fixing reference errors', 'Unknown Director', 120, 'Action', 'Vietnamese', 'PG13', 50000, 7.0, '2024-01-01', 'NOW_SHOWING', NOW(), NOW());

-- Kiểm tra kết quả
SELECT 'Movie ID 1 created:' as info, id, title, status FROM movies WHERE id = 1;
"@

# Lưu script
$simpleSQL | Out-File -FilePath "simple_movie_fix.sql" -Encoding UTF8

Write-Host "📝 Created simple fix script: simple_movie_fix.sql" -ForegroundColor Green

# Tạo script để xóa tất cả dữ liệu và bắt đầu lại
$resetSQL = @"
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
VALUES ('admin-001', 'admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Administrator', 'ADMIN', true, NOW(), NOW());

SELECT 'Database reset completed' as status;
"@

$resetSQL | Out-File -FilePath "reset_database.sql" -Encoding UTF8

Write-Host "📝 Created reset script: reset_database.sql" -ForegroundColor Green

Write-Host "`n🔧 Manual fix instructions:" -ForegroundColor Blue
Write-Host "1. Open MySQL command line or MySQL Workbench" -ForegroundColor White
Write-Host "2. Run one of these scripts:" -ForegroundColor White
Write-Host "   - For quick fix: simple_movie_fix.sql" -ForegroundColor Cyan
Write-Host "   - For complete reset: reset_database.sql" -ForegroundColor Cyan

Write-Host "`n📋 Quick fix commands:" -ForegroundColor Yellow
Write-Host "mysql -u root -p" -ForegroundColor White
Write-Host "source simple_movie_fix.sql" -ForegroundColor White

Write-Host "`n📋 Complete reset commands:" -ForegroundColor Yellow
Write-Host "mysql -u root -p" -ForegroundColor White
Write-Host "source reset_database.sql" -ForegroundColor White

Write-Host "`n🌐 After fixing:" -ForegroundColor Blue
Write-Host "1. Restart Spring Boot application" -ForegroundColor White
Write-Host "2. Test at: http://localhost:5173" -ForegroundColor White
Write-Host "3. If using reset, the app will seed new data automatically" -ForegroundColor White

Write-Host "`n⚠️  Recommendation:" -ForegroundColor Yellow
Write-Host "Use the complete reset if you don't have important data" -ForegroundColor White
Write-Host "Use the quick fix if you want to keep existing data" -ForegroundColor White

Write-Host "`n🏁 Scripts ready for manual execution" -ForegroundColor Green
