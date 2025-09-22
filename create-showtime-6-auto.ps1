# Script để tự động tạo showtime ID 6
Write-Host "🔧 Auto-creating showtime ID 6..." -ForegroundColor Yellow

# Tạo script SQL để tạo showtime ID 6
$sqlScript = @"
USE movietickets;

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

-- Kiểm tra showtime ID 6
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
"@

$sqlScript | Out-File -FilePath "create_showtime_6_auto.sql" -Encoding UTF8

Write-Host "📝 Created create_showtime_6_auto.sql" -ForegroundColor Green

# Thử chạy MySQL command
Write-Host "`n🔍 Attempting to run MySQL command..." -ForegroundColor Blue

try {
    # Thử chạy MySQL command
    $mysqlCommand = "mysql -u root -p < create_showtime_6_auto.sql"
    Write-Host "Running: $mysqlCommand" -ForegroundColor Cyan
    
    # Chạy MySQL command
    $result = cmd /c "mysql -u root -p < create_showtime_6_auto.sql 2>&1"
    Write-Host "MySQL result: $result" -ForegroundColor White
    
    if ($result -match "ERROR") {
        Write-Host "❌ MySQL command failed" -ForegroundColor Red
        Write-Host "Please run manually:" -ForegroundColor Yellow
        Write-Host "mysql -u root -p < create_showtime_6_auto.sql" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Showtime ID 6 created successfully!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ MySQL command failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run manually:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p < create_showtime_6_auto.sql" -ForegroundColor Cyan
}

Write-Host "`n🏁 Auto-create showtime 6 completed" -ForegroundColor Green
