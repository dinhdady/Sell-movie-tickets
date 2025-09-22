# Script tạo user test và sửa lỗi
Write-Host "🔧 Creating test user and fixing issues..." -ForegroundColor Yellow

# 1. Tạo SQL script để tạo user test
$createUserSql = @"
USE movietickets;

-- Tạo user test nếu chưa có
INSERT INTO users (id, username, email, password, full_name, phone, is_active, email_verified, role, created_at, updated_at)
VALUES (
    'test-user-123',
    'testuser',
    'test@example.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', -- password: password
    'Test User',
    '0123456789',
    1,
    1,
    'USER',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    email = VALUES(email),
    password = VALUES(password),
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    is_active = VALUES(is_active),
    email_verified = VALUES(email_verified),
    role = VALUES(role),
    updated_at = NOW();

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
SELECT 'USER TEST:' as status;
SELECT id, username, email, is_active, email_verified, role FROM users WHERE username = 'testuser';

SELECT 'SHOWTIME ID 6:' as status;
SELECT id, movie_id, room_id, start_time, end_time, price, status FROM showtimes WHERE id = 6;

SELECT 'SEATS ID 1 AND 2:' as status;
SELECT id, seat_number, row_number, column_number, seat_type, room_id, price FROM seats WHERE id IN (1, 2);
"@

$createUserSql | Out-File -FilePath "create_test_user.sql" -Encoding UTF8
Write-Host "✅ Created create_test_user.sql" -ForegroundColor Green

# 2. Test với user mới
Write-Host "`n🔍 Testing with new user..." -ForegroundColor Blue

try {
    # Login với user mới
    $loginData = @{
        username = "testuser"
        password = "password"
    } | ConvertTo-Json

    Write-Host "Login data: $loginData" -ForegroundColor Cyan

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.object.accessToken
    $user = $loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)" -ForegroundColor Cyan
    Write-Host "   Username: $($user.username)" -ForegroundColor Cyan

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Test showtime API
    Write-Host "`n🔍 Testing showtime API..." -ForegroundColor Blue
    try {
        $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get -Headers $headers
        Write-Host "✅ Showtimes retrieved successfully!" -ForegroundColor Green
        Write-Host "   Found $($showtimeResponse.Count) showtimes" -ForegroundColor Cyan
        
        # Tìm showtime ID 6
        $showtime6 = $showtimeResponse | Where-Object { $_.id -eq 6 }
        if ($showtime6) {
            Write-Host "✅ Found showtime ID 6!" -ForegroundColor Green
        } else {
            Write-Host "❌ Showtime ID 6 not found. Please run the SQL script first." -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Failed to get showtimes: $($_.Exception.Message)" -ForegroundColor Red
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

        Write-Host "`n🎉 All tests passed! The 400 error is fixed!" -ForegroundColor Green

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
    Write-Host "Please run the SQL script first: mysql -u root -p < create_test_user.sql" -ForegroundColor Yellow
}

Write-Host "`n🏁 Test completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run SQL script: mysql -u root -p < create_test_user.sql" -ForegroundColor Cyan
Write-Host "2. Test again: .\test-with-auth.ps1" -ForegroundColor Cyan
Write-Host "3. The 400 error should be fixed!" -ForegroundColor Cyan
