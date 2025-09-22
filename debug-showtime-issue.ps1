# Script để debug và sửa vấn đề showtime ID 6
Write-Host "🔍 Debugging showtime ID 6 issue..." -ForegroundColor Yellow

# 1. Kiểm tra showtime API
Write-Host "`n🔍 Step 1: Testing showtime API..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get
    Write-Host "✅ All showtimes:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    # Tìm showtime ID 6
    $showtime6 = $response | Where-Object { $_.id -eq 6 }
    if ($showtime6) {
        Write-Host "✅ Found showtime ID 6:" -ForegroundColor Green
        $showtime6 | ConvertTo-Json -Depth 3 | Write-Host
    } else {
        Write-Host "❌ Showtime ID 6 NOT FOUND!" -ForegroundColor Red
        Write-Host "Available showtime IDs:" -ForegroundColor Yellow
        $response | ForEach-Object { Write-Host "  - ID: $($_.id)" -ForegroundColor Cyan }
    }
} catch {
    Write-Host "❌ Failed to get showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Kiểm tra showtime cho movie ID 7
Write-Host "`n🔍 Step 2: Testing showtimes for movie ID 7..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/7" -Method Get
    Write-Host "✅ Showtimes for movie 7:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "❌ Failed to get showtimes for movie 7: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Tạo showtime ID 6 nếu không tồn tại
Write-Host "`n🔍 Step 3: Creating showtime ID 6 if needed..." -ForegroundColor Blue

$createShowtime6 = @"
USE movietickets;

-- Kiểm tra showtime ID 6
SELECT * FROM showtimes WHERE id = 6;

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

$createShowtime6 | Out-File -FilePath "create_showtime_6_debug.sql" -Encoding UTF8
Write-Host "📝 Created create_showtime_6_debug.sql" -ForegroundColor Green

# 4. Test booking với showtime ID 6
Write-Host "`n🔍 Step 4: Testing booking with showtime ID 6..." -ForegroundColor Blue

try {
    # Login first
    $loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.object.accessToken
    
    Write-Host "✅ Login successful, token: $($token.Substring(0, 20))..." -ForegroundColor Green

    # Test order creation with showtime ID 6
    $orderData = @{
        userId = "cabe9e63"
        showtimeId = 6
        totalPrice = 120000
        customerEmail = "test@example.com"
        customerName = "Test User"
        customerPhone = "0123456789"
        customerAddress = "Test Address"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body $orderData -Headers $headers
    Write-Host "✅ Order creation test successful:" -ForegroundColor Green
    $orderResponse | ConvertTo-Json -Depth 3 | Write-Host

} catch {
    Write-Host "❌ Order creation test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Debug completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the SQL script: mysql -u root -p < create_showtime_6_debug.sql" -ForegroundColor Cyan
Write-Host "2. Restart the backend if needed" -ForegroundColor Cyan
Write-Host "3. Test the booking flow again" -ForegroundColor Cyan