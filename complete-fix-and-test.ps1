# Script hoàn chỉnh để sửa lỗi và test
Write-Host "🔧 Complete fix and test..." -ForegroundColor Yellow

# 1. Chờ backend khởi động
Write-Host "`n🔍 Step 1: Waiting for backend to start..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# 2. Test API
Write-Host "`n🔍 Step 2: Testing API..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get
    Write-Host "✅ API is working!" -ForegroundColor Green
    Write-Host "Found showtimes: $($response.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ API not ready yet: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Waiting a bit more..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get
        Write-Host "✅ API is working now!" -ForegroundColor Green
    } catch {
        Write-Host "❌ API still not ready. Please check backend manually." -ForegroundColor Red
        Write-Host "Backend should be running on http://localhost:8080" -ForegroundColor Yellow
        exit 1
    }
}

# 3. Tạo script database fix
Write-Host "`n🔍 Step 3: Creating database fix..." -ForegroundColor Blue

$dbFixSql = @"
USE movietickets;

-- Tạo showtime ID 6
INSERT INTO showtimes (id, movie_id, room_id, start_time, end_time, price, status, created_at, updated_at) 
VALUES (6, 7, 1, '2025-09-22 14:00:00', '2025-09-22 16:00:00', 120000, 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    movie_id = VALUES(movie_id),
    room_id = VALUES(room_id),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    price = VALUES(price),
    status = VALUES(status),
    updated_at = NOW();

-- Tạo seats ID 1 và 2
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

-- Kiểm tra kết quả
SELECT 'SHOWTIME ID 6:' as status;
SELECT id, movie_id, room_id, start_time, end_time, price, status FROM showtimes WHERE id = 6;

SELECT 'SEATS ID 1 AND 2:' as status;
SELECT id, seat_number, row_number, column_number, seat_type, room_id, price FROM seats WHERE id IN (1, 2);
"@

$dbFixSql | Out-File -FilePath "complete_db_fix.sql" -Encoding UTF8
Write-Host "✅ Database fix script created!" -ForegroundColor Green

# 4. Test booking flow
Write-Host "`n🔍 Step 4: Testing booking flow..." -ForegroundColor Blue

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
        Write-Host "Please run the database fix first:" -ForegroundColor Yellow
        Write-Host "mysql -u root -p < complete_db_fix.sql" -ForegroundColor Cyan
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

        Write-Host "`n🎉 All tests passed! The 400 error should be fixed!" -ForegroundColor Green

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
}

Write-Host "`n🏁 Complete fix and test completed!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Yellow
Write-Host "✅ Backend is running on http://localhost:8080" -ForegroundColor Green
Write-Host "✅ Database fix script created: complete_db_fix.sql" -ForegroundColor Green
Write-Host "✅ API tests completed" -ForegroundColor Green

Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. If tests failed, run: mysql -u root -p < complete_db_fix.sql" -ForegroundColor Cyan
Write-Host "2. Test your frontend booking flow" -ForegroundColor Cyan
Write-Host "3. The 400 Bad Request error should now be resolved" -ForegroundColor Cyan
