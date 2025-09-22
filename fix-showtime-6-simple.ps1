# Script đơn giản để tạo showtime ID 6
Write-Host "🔧 Creating showtime ID 6..." -ForegroundColor Yellow

# Tạo SQL script
$sqlScript = @"
USE movietickets;

-- Kiểm tra showtime ID 6 hiện tại
SELECT 'BEFORE - Current showtime ID 6:' as status;
SELECT * FROM showtimes WHERE id = 6;

-- Tạo showtime ID 6
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

-- Kiểm tra showtime ID 6 sau khi tạo
SELECT 'AFTER - Showtime ID 6 created:' as status;
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
WHERE s.id = 6;

-- Hiển thị tất cả showtimes để kiểm tra
SELECT 'ALL SHOWTIMES:' as status;
SELECT id, movie_id, room_id, start_time, end_time, status FROM showtimes ORDER BY id;
"@

$sqlScript | Out-File -FilePath "fix_showtime_6.sql" -Encoding UTF8

Write-Host "📝 Created fix_showtime_6.sql" -ForegroundColor Green

Write-Host "`n🔍 Manual steps to fix:" -ForegroundColor Yellow
Write-Host "1. Open MySQL command line:" -ForegroundColor Cyan
Write-Host "   mysql -u root -p" -ForegroundColor White
Write-Host "2. Run the SQL script:" -ForegroundColor Cyan
Write-Host "   source fix_showtime_6.sql;" -ForegroundColor White
Write-Host "3. Or copy-paste the SQL content directly" -ForegroundColor Cyan

Write-Host "`n📋 SQL Content:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host $sqlScript -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "`n🏁 Script completed!" -ForegroundColor Green
