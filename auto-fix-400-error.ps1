# Script tự động sửa lỗi 400 Bad Request
Write-Host "🔧 Auto-fixing 400 Bad Request error..." -ForegroundColor Yellow

# Tạo SQL script để sửa lỗi
$fixSql = @"
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

-- Tạo seats ID 1 và 2 nếu chưa có
INSERT INTO seats (id, seat_number, row_number, column_number, seat_type, room_id, price, created_at, updated_at)
VALUES 
(1, 'A1', 'A', 1, 'REGULAR', 1, 120000, NOW(), NOW()),
(2, 'A2', 'A', 2, 'REGULAR', 1, 120000, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    seat_number = VALUES(seat_number),
    row_number = VALUES(row_number),
    column_number = VALUES(column_number),
    seat_type = VALUES(seat_type),
    room_id = VALUES(room_id),
    price = VALUES(price),
    updated_at = NOW();

-- Kiểm tra lại dữ liệu sau khi tạo
SELECT 'AFTER FIX - SHOWTIME ID 6:' as status;
SELECT 
    s.id,
    s.movie_id,
    m.title as movie_title,
    s.room_id,
    r.name as room_name,
    s.start_time,
    s.end_time,
    s.price,
    s.status
FROM showtimes s
LEFT JOIN movies m ON s.movie_id = m.id
LEFT JOIN rooms r ON s.room_id = r.id
WHERE s.id = 6;

SELECT 'AFTER FIX - SEATS ID 1 AND 2:' as status;
SELECT 
    s.id,
    s.seat_number,
    s.row_number,
    s.column_number,
    s.seat_type,
    s.room_id,
    s.price
FROM seats s
WHERE s.id IN (1, 2);
"@

# Lưu SQL script
$fixSql | Out-File -FilePath "auto_fix_400.sql" -Encoding UTF8

Write-Host "📝 Created auto_fix_400.sql" -ForegroundColor Green

# Thử chạy MySQL command
Write-Host "`n🔍 Attempting to run MySQL command..." -ForegroundColor Blue

try {
    # Thử chạy MySQL command trực tiếp
    $mysqlCommand = "mysql -u root -p -e `"$($fixSql -replace '"', '\"')`""
    Write-Host "Running: $mysqlCommand" -ForegroundColor Cyan
    
    # Chạy MySQL command
    $result = cmd /c "mysql -u root -p -e `"$($fixSql -replace '"', '\"')`" 2>&1"
    Write-Host "MySQL result: $result" -ForegroundColor White
    
    if ($result -match "ERROR") {
        Write-Host "❌ MySQL command failed" -ForegroundColor Red
        Write-Host "Please run manually:" -ForegroundColor Yellow
        Write-Host "mysql -u root -p < auto_fix_400.sql" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Auto-fix completed successfully!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ MySQL command failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run manually:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p < auto_fix_400.sql" -ForegroundColor Cyan
}

# Test API sau khi sửa
Write-Host "`n🧪 Testing API after auto-fix..." -ForegroundColor Blue

try {
    # Login
    $loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.object.accessToken
    $user = $loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)" -ForegroundColor Cyan

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Test showtime ID 6
    Write-Host "`n🔍 Testing showtime ID 6..." -ForegroundColor Blue
    try {
        $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method Get -Headers $headers
        Write-Host "✅ Showtime ID 6 found!" -ForegroundColor Green
        Write-Host "   Movie ID: $($showtimeResponse.object.movie_id)" -ForegroundColor Cyan
        Write-Host "   Room ID: $($showtimeResponse.object.room_id)" -ForegroundColor Cyan
        Write-Host "   Status: $($showtimeResponse.object.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Showtime ID 6 not found: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test order creation
    Write-Host "`n🔍 Testing order creation..." -ForegroundColor Blue
    try {
        $orderData = @{
            userId = $user.id
            showtimeId = 6
            totalPrice = 360000
            customerEmail = "test@example.com"
            customerName = "Test User"
            customerPhone = "0123456789"
            customerAddress = "Test Address"
        } | ConvertTo-Json

        $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body $orderData -Headers $headers
        Write-Host "✅ Order created successfully!" -ForegroundColor Green
        Write-Host "   Order ID: $($orderResponse.object.id)" -ForegroundColor Cyan

        # Test booking creation
        Write-Host "`n🔍 Testing booking creation..." -ForegroundColor Blue
        $bookingData = @{
            userId = $user.id
            showtimeId = 6
            orderId = $orderResponse.object.id
            totalPrice = 360000
            customerName = "Test User"
            customerEmail = "test@example.com"
            customerPhone = "0123456789"
            customerAddress = "Test Address"
            seatIds = @(1, 2)
        } | ConvertTo-Json

        $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body $bookingData -Headers $headers
        Write-Host "✅ Booking created successfully!" -ForegroundColor Green
        Write-Host "   Booking ID: $($bookingResponse.object.id)" -ForegroundColor Cyan

        Write-Host "`n🎉 Auto-fix completed successfully!" -ForegroundColor Green
        Write-Host "The 400 Bad Request error should now be fixed!" -ForegroundColor Green

    } catch {
        Write-Host "❌ Order/Booking creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Error details: $errorBody" -ForegroundColor Red
            } catch {
                Write-Host "Could not read error details" -ForegroundColor Red
            }
        }
    }

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check if backend is running on port 8080" -ForegroundColor Yellow
}

Write-Host "`n🏁 Auto-fix completed!" -ForegroundColor Green
