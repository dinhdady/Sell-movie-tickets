# Script để kiểm tra và sửa lỗi showtime ID 6
Write-Host "🔍 Checking and fixing showtime ID 6..." -ForegroundColor Yellow

# 1. Tạo SQL script để kiểm tra showtime ID 6
$checkSql = @"
USE movietickets;

-- Kiểm tra showtime ID 6
SELECT 'CHECKING SHOWTIME ID 6:' as status;
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
    s.created_at,
    s.updated_at
FROM showtimes s
LEFT JOIN movies m ON s.movie_id = m.id
LEFT JOIN rooms r ON s.room_id = r.id
LEFT JOIN cinemas c ON r.cinema_id = c.id
WHERE s.id = 6;

-- Kiểm tra tất cả showtimes
SELECT 'ALL SHOWTIMES:' as status;
SELECT id, movie_id, room_id, start_time, end_time, status FROM showtimes ORDER BY id;

-- Kiểm tra order ID 308
SELECT 'CHECKING ORDER ID 308:' as status;
SELECT * FROM orders WHERE id = 308;
"@

$checkSql | Out-File -FilePath "check_showtime_6.sql" -Encoding UTF8

# 2. Tạo SQL script để tạo showtime ID 6 nếu chưa có
$createSql = @"
USE movietickets;

-- Tạo showtime ID 6 nếu chưa có
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

-- Kiểm tra lại showtime ID 6
SELECT 'AFTER CREATING SHOWTIME ID 6:' as status;
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

$createSql | Out-File -FilePath "create_showtime_6.sql" -Encoding UTF8

# 3. Tạo script để test API
$testApiScript = @"
# Test API để kiểm tra showtime ID 6
Write-Host "🧪 Testing API with showtime ID 6..." -ForegroundColor Yellow

# Login first
try {
    `$loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    `$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body `$loginData -ContentType "application/json"
    `$token = `$loginResponse.object.accessToken
    `$user = `$loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: `$(`$user.id)" -ForegroundColor Cyan

    # Test showtime API
    `$headers = @{
        "Authorization" = "Bearer `$token"
        "Content-Type" = "application/json"
    }

    `$showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get -Headers `$headers
    Write-Host "✅ Showtimes retrieved successfully!" -ForegroundColor Green
    
    # Tìm showtime ID 6
    `$showtime6 = `$showtimeResponse | Where-Object { `$_.id -eq 6 }
    if (`$showtime6) {
        Write-Host "✅ Found showtime ID 6:" -ForegroundColor Green
        Write-Host "   Movie ID: `$(`$showtime6.movie_id)" -ForegroundColor Cyan
        Write-Host "   Room ID: `$(`$showtime6.room_id)" -ForegroundColor Cyan
        Write-Host "   Status: `$(`$showtime6.status)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Showtime ID 6 not found!" -ForegroundColor Red
        Write-Host "Available showtime IDs:" -ForegroundColor Yellow
        `$showtimeResponse | ForEach-Object { Write-Host "  - ID: `$(`$_.id)" -ForegroundColor Cyan }
    }

    # Test order creation with showtime ID 6
    `$orderData = @{
        userId = `$user.id
        showtimeId = 6
        totalPrice = 360000
        customerEmail = "test@example.com"
        customerName = "Test User"
        customerPhone = "0123456789"
        customerAddress = "Test Address"
    } | ConvertTo-Json

    Write-Host "`n🧪 Testing order creation with showtime ID 6..." -ForegroundColor Blue
    `$orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body `$orderData -Headers `$headers
    Write-Host "✅ Order creation successful!" -ForegroundColor Green
    Write-Host "   Order ID: `$(`$orderResponse.object.id)" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Test failed: `$(`$_.Exception.Message)" -ForegroundColor Red
    if (`$_.Exception.Response) {
        try {
            `$errorStream = `$_.Exception.Response.GetResponseStream()
            `$reader = New-Object System.IO.StreamReader(`$errorStream)
            `$errorBody = `$reader.ReadToEnd()
            Write-Host "Error details: `$errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}
"@

$testApiScript | Out-File -FilePath "test_showtime_6_api.ps1" -Encoding UTF8

Write-Host "📝 Created scripts:" -ForegroundColor Green
Write-Host "  1. check_showtime_6.sql - Kiểm tra showtime ID 6" -ForegroundColor Cyan
Write-Host "  2. create_showtime_6.sql - Tạo showtime ID 6" -ForegroundColor Cyan
Write-Host "  3. test_showtime_6_api.ps1 - Test API với showtime ID 6" -ForegroundColor Cyan

Write-Host "`n🔍 Manual steps to fix:" -ForegroundColor Yellow
Write-Host "1. Open MySQL command line:" -ForegroundColor Cyan
Write-Host "   mysql -u root -p" -ForegroundColor White
Write-Host "2. Run check script:" -ForegroundColor Cyan
Write-Host "   source check_showtime_6.sql;" -ForegroundColor White
Write-Host "3. If showtime ID 6 doesn't exist, run:" -ForegroundColor Cyan
Write-Host "   source create_showtime_6.sql;" -ForegroundColor White
Write-Host "4. Test API:" -ForegroundColor Cyan
Write-Host "   .\test_showtime_6_api.ps1" -ForegroundColor White

Write-Host "`n🏁 Scripts created successfully!" -ForegroundColor Green
