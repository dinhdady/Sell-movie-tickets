# Script hoàn chỉnh để sửa lỗi 400 Bad Request
Write-Host "🔧 Complete fix for 400 Bad Request error..." -ForegroundColor Yellow

# 1. Kiểm tra backend
Write-Host "`n🔍 Step 1: Checking backend..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start backend first: .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# 2. Tạo SQL script hoàn chỉnh
Write-Host "`n🔍 Step 2: Creating complete SQL fix..." -ForegroundColor Blue

$completeSql = @"
USE movietickets;

-- Xóa dữ liệu cũ nếu có
DELETE FROM showtime_seat_bookings WHERE showtime_id = 6;
DELETE FROM bookings WHERE showtime_id = 6;
DELETE FROM orders WHERE id = 308;
DELETE FROM showtimes WHERE id = 6;
DELETE FROM seats WHERE id IN (1, 2);
DELETE FROM users WHERE username = 'testuser';

-- Tạo user test
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
);

-- Tạo showtime ID 6
INSERT INTO showtimes (id, movie_id, room_id, start_time, end_time, price, status, created_at, updated_at) 
VALUES (6, 7, 1, '2025-09-22 14:00:00', '2025-09-22 16:00:00', 120000, 'ACTIVE', NOW(), NOW());

-- Tạo seats ID 1 và 2
INSERT INTO seats (id, seat_number, row_number, column_number, seat_type, room_id, price, created_at, updated_at)
VALUES 
(1, 'A1', 'A', 1, 'REGULAR', 1, 120000, NOW(), NOW()),
(2, 'A2', 'A', 2, 'REGULAR', 1, 120000, NOW(), NOW());

-- Tạo order ID 308
INSERT INTO orders (id, user_id, txn_ref, total_price, status, customer_email, created_at)
VALUES (308, 'test-user-123', 'TXN308', 360000, 'PENDING', 'test@example.com', NOW());

-- Kiểm tra kết quả
SELECT 'USER TEST:' as status;
SELECT id, username, email, is_active, email_verified, role FROM users WHERE username = 'testuser';

SELECT 'SHOWTIME ID 6:' as status;
SELECT id, movie_id, room_id, start_time, end_time, price, status FROM showtimes WHERE id = 6;

SELECT 'SEATS ID 1 AND 2:' as status;
SELECT id, seat_number, row_number, column_number, seat_type, room_id, price FROM seats WHERE id IN (1, 2);

SELECT 'ORDER ID 308:' as status;
SELECT id, user_id, txn_ref, total_price, status, customer_email FROM orders WHERE id = 308;
"@

$completeSql | Out-File -FilePath "complete_fix_400.sql" -Encoding UTF8
Write-Host "✅ Created complete_fix_400.sql" -ForegroundColor Green

# 3. Test API sau khi sửa
Write-Host "`n🔍 Step 3: Testing API after fix..." -ForegroundColor Blue

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

    # Test showtime
    Write-Host "`n🔍 Testing showtime ID 6..." -ForegroundColor Blue
    try {
        $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method Get -Headers $headers
        Write-Host "✅ Showtime ID 6 found!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Showtime ID 6 not found. Please run SQL script first." -ForegroundColor Red
    }

    # Test order
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

        # Test booking
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
        Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "Please run the SQL script first: mysql -u root -p < complete_fix_400.sql" -ForegroundColor Yellow
}

Write-Host "`n🏁 Complete fix completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run SQL script: mysql -u root -p < complete_fix_400.sql" -ForegroundColor Cyan
Write-Host "2. Test again: .\debug-booking-400.ps1" -ForegroundColor Cyan
Write-Host "3. The 400 error should be fixed!" -ForegroundColor Cyan
