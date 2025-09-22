# Script để sửa lỗi Movie reference error
Write-Host "🔧 Fixing Movie reference error..." -ForegroundColor Yellow

# Tạo script SQL để kiểm tra và sửa lỗi
$sqlScript = @"
-- Kiểm tra movies table
SELECT 'Movies count:' as info, COUNT(*) as count FROM movies;

-- Kiểm tra movie ID 1
SELECT 'Movie ID 1:' as info, id, title, status FROM movies WHERE id = 1;

-- Kiểm tra showtimes tham chiếu movie ID 1
SELECT 'Showtimes referencing movie ID 1:' as info, COUNT(*) as count 
FROM showtimes WHERE movie_id = 1;

-- Kiểm tra bookings tham chiếu movie ID 1 (qua showtimes)
SELECT 'Bookings referencing movie ID 1:' as info, COUNT(*) as count 
FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
WHERE s.movie_id = 1;

-- Hiển thị chi tiết showtimes tham chiếu movie ID 1
SELECT 'Showtime details:' as info, s.id, s.movie_id, s.start_time, s.end_time
FROM showtimes s 
WHERE s.movie_id = 1;

-- Hiển thị chi tiết bookings tham chiếu movie ID 1
SELECT 'Booking details:' as info, b.id, b.customer_name, b.customer_email, s.movie_id
FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
WHERE s.movie_id = 1;
"@

# Lưu script SQL
$sqlScript | Out-File -FilePath "check_movie_references.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: check_movie_references.sql" -ForegroundColor Green

# Tạo script để xóa orphaned data
$cleanupScript = @"
-- Xóa orphaned bookings (bookings tham chiếu movie không tồn tại)
DELETE b FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
LEFT JOIN movies m ON s.movie_id = m.id 
WHERE m.id IS NULL;

-- Xóa orphaned showtimes (showtimes tham chiếu movie không tồn tại)
DELETE s FROM showtimes s 
LEFT JOIN movies m ON s.movie_id = m.id 
WHERE m.id IS NULL;

-- Xóa orphaned tickets (tickets tham chiếu booking không tồn tại)
DELETE t FROM tickets t 
LEFT JOIN bookings b ON t.order_id = b.order_id 
WHERE b.id IS NULL;

-- Xóa orphaned orders (orders tham chiếu booking không tồn tại)
DELETE o FROM orders o 
LEFT JOIN bookings b ON o.id = b.order_id 
WHERE b.id IS NULL;
"@

$cleanupScript | Out-File -FilePath "cleanup_orphaned_data.sql" -Encoding UTF8

Write-Host "📝 Created cleanup script: cleanup_orphaned_data.sql" -ForegroundColor Green

# Tạo script để tạo movie ID 1 nếu cần
$createMovieScript = @"
-- Tạo movie ID 1 nếu không tồn tại
INSERT IGNORE INTO movies (id, title, description, director, duration, genre, language, film_rating, price, rating, release_date, status, created_at, updated_at)
VALUES (1, 'Movie Placeholder', 'This is a placeholder movie', 'Unknown Director', 120, 'Action', 'Vietnamese', 'PG13', 50000, 7.0, '2024-01-01', 'NOW_SHOWING', NOW(), NOW());

-- Cập nhật showtimes tham chiếu movie ID 1 để trỏ đến movie thực tế
-- (Chỉ thực hiện nếu có movie khác trong database)
UPDATE showtimes s 
JOIN movies m ON m.id = (SELECT id FROM movies WHERE id != 1 ORDER BY id LIMIT 1)
SET s.movie_id = m.id 
WHERE s.movie_id = 1;
"@

$createMovieScript | Out-File -FilePath "create_movie_placeholder.sql" -Encoding UTF8

Write-Host "📝 Created movie placeholder script: create_movie_placeholder.sql" -ForegroundColor Green

Write-Host "`n🔍 Steps to fix the error:" -ForegroundColor Blue
Write-Host "1. Run: mysql -u root -p < check_movie_references.sql" -ForegroundColor White
Write-Host "2. Check the results to understand the issue" -ForegroundColor White
Write-Host "3. If orphaned data found, run: mysql -u root -p < cleanup_orphaned_data.sql" -ForegroundColor White
Write-Host "4. If movie ID 1 missing, run: mysql -u root -p < create_movie_placeholder.sql" -ForegroundColor White
Write-Host "5. Restart the application" -ForegroundColor White

Write-Host "`n⚠️  Alternative quick fix:" -ForegroundColor Yellow
Write-Host "If you want to quickly fix the error, you can:" -ForegroundColor White
Write-Host "1. Delete all data and start fresh" -ForegroundColor White
Write-Host "2. Or create a movie with ID 1" -ForegroundColor White

Write-Host "`n🌐 Test the application after fixing:" -ForegroundColor Blue
Write-Host "http://localhost:5173" -ForegroundColor Cyan

Write-Host "`n🏁 Scripts created successfully" -ForegroundColor Green
