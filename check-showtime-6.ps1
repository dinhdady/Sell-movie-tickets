# Script để kiểm tra showtime ID 6
Write-Host "🔍 Checking showtime ID 6..." -ForegroundColor Yellow

# Tạo SQL script để kiểm tra showtime ID 6
$checkShowtime6SQL = @"
SELECT 
    s.id,
    s.movie_id,
    m.title as movie_title,
    s.room_id,
    r.name as room_name,
    c.name as cinema_name,
    s.start_time,
    s.end_time,
    s.price,
    s.status,
    s.created_at
FROM showtimes s
LEFT JOIN movies m ON s.movie_id = m.id
LEFT JOIN rooms r ON s.room_id = r.id
LEFT JOIN cinemas c ON r.cinema_id = c.id
WHERE s.id = 6;
"@

$checkShowtime6SQL | Out-File -FilePath "check_showtime_6.sql" -Encoding UTF8

Write-Host "📝 Created check_showtime_6.sql" -ForegroundColor Green

# Tạo script để kiểm tra tất cả showtimes
$checkAllShowtimesSQL = @"
SELECT 
    s.id,
    s.movie_id,
    m.title as movie_title,
    s.room_id,
    r.name as room_name,
    c.name as cinema_name,
    s.start_time,
    s.end_time,
    s.price,
    s.status
FROM showtimes s
LEFT JOIN movies m ON s.movie_id = m.id
LEFT JOIN rooms r ON s.room_id = r.id
LEFT JOIN cinemas c ON r.cinema_id = c.id
ORDER BY s.id;
"@

$checkAllShowtimesSQL | Out-File -FilePath "check_all_showtimes.sql" -Encoding UTF8

Write-Host "📝 Created check_all_showtimes.sql" -ForegroundColor Green

# Tạo script để tạo showtime ID 6 nếu không tồn tại
$createShowtime6SQL = @"
-- Tạo showtime ID 6 nếu chưa tồn tại
INSERT INTO showtimes (id, movie_id, room_id, start_time, end_time, price, status, created_at, updated_at) 
VALUES (
    6, -- id
    7, -- movie_id (TỬ CHIẾN TRÊN KHÔNG)
    1, -- room_id
    '2025-09-22 14:00:00', -- start_time
    '2025-09-22 16:00:00', -- end_time
    120000, -- price
    'ACTIVE', -- status
    NOW(), -- created_at
    NOW()  -- updated_at
) ON DUPLICATE KEY UPDATE
    movie_id = VALUES(movie_id),
    room_id = VALUES(room_id),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    price = VALUES(price),
    status = VALUES(status),
    updated_at = NOW();
"@

$createShowtime6SQL | Out-File -FilePath "create_showtime_6.sql" -Encoding UTF8

Write-Host "📝 Created create_showtime_6.sql" -ForegroundColor Green

Write-Host "`n🔍 Manual steps:" -ForegroundColor Blue
Write-Host "1. Open MySQL command line" -ForegroundColor White
Write-Host "2. Run: mysql -u root -p" -ForegroundColor White
Write-Host "3. Run: USE movietickets;" -ForegroundColor White
Write-Host "4. Run: source check_showtime_6.sql;" -ForegroundColor White
Write-Host "5. Run: source check_all_showtimes.sql;" -ForegroundColor White
Write-Host "6. If showtime 6 doesn't exist, run: source create_showtime_6.sql;" -ForegroundColor White

Write-Host "`n🏁 Showtime 6 check completed" -ForegroundColor Green
