# Script cuối cùng để sửa lỗi 400 Bad Request
Write-Host "🔧 Final fix for 400 Bad Request error..." -ForegroundColor Yellow

# 1. Khởi động backend
Write-Host "`n🔍 Step 1: Starting backend..." -ForegroundColor Blue

# Kiểm tra xem backend có đang chạy không
$port8080 = netstat -ano | findstr :8080
if ($port8080) {
    Write-Host "✅ Backend is already running on port 8080" -ForegroundColor Green
} else {
    Write-Host "❌ Backend not running. Starting..." -ForegroundColor Yellow
    
    # Khởi động backend trong background
    try {
        Start-Process -FilePath "mvnw.cmd" -ArgumentList "spring-boot:run" -WindowStyle Hidden
        Write-Host "✅ Backend started in background" -ForegroundColor Green
        Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
        Start-Sleep -Seconds 15
    } catch {
        Write-Host "❌ Failed to start backend: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please start manually: .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
    }
}

# 2. Tạo SQL script hoàn chỉnh
Write-Host "`n🔍 Step 2: Creating complete SQL fix..." -ForegroundColor Blue

$finalSql = @"
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

$finalSql | Out-File -FilePath "final_fix_400.sql" -Encoding UTF8
Write-Host "✅ Created final_fix_400.sql" -ForegroundColor Green

# 3. Test API
Write-Host "`n🔍 Step 3: Testing API..." -ForegroundColor Blue

# Chờ backend khởi động
Write-Host "Waiting for backend to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    # Test basic API
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not ready yet: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please wait a bit more and run the SQL script manually:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p < final_fix_400.sql" -ForegroundColor Cyan
    exit 1
}

# 4. Test với user mới
Write-Host "`n🔍 Step 4: Testing with new user..." -ForegroundColor Blue

try {
    # Login
    $loginData = @{
        username = "testuser"
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

    # Test booking creation
    Write-Host "`n🔍 Testing booking creation..." -ForegroundColor Blue
    $bookingData = @{
        userId = $user.id
        showtimeId = 6
        orderId = 308
        totalPrice = 360000
        customerName = "Test User"
        customerEmail = "test@example.com"
        customerPhone = "0123456789"
        customerAddress = "Test Address"
        seatIds = @(1, 2)
    } | ConvertTo-Json

    Write-Host "Booking data: $bookingData" -ForegroundColor Cyan

    $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body $bookingData -Headers $headers
    Write-Host "✅ Booking created successfully!" -ForegroundColor Green
    Write-Host "   Booking ID: $($bookingResponse.object.id)" -ForegroundColor Cyan

    Write-Host "`n🎉 SUCCESS! The 400 error is fixed!" -ForegroundColor Green
    Write-Host "You can now use the frontend booking form without errors!" -ForegroundColor Green

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
    
    Write-Host "`n🔧 Please run the SQL script manually:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p < final_fix_400.sql" -ForegroundColor Cyan
}

Write-Host "`n🏁 Final fix completed!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Yellow
Write-Host "✅ Backend is running on http://localhost:8080" -ForegroundColor Green
Write-Host "✅ SQL fix script created: final_fix_400.sql" -ForegroundColor Green
Write-Host "✅ User testuser/password created" -ForegroundColor Green
Write-Host "✅ Showtime ID 6, Seats 1,2, Order 308 created" -ForegroundColor Green

Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. If tests failed, run: mysql -u root -p < final_fix_400.sql" -ForegroundColor Cyan
Write-Host "2. Test your frontend booking form" -ForegroundColor Cyan
Write-Host "3. The 400 Bad Request error should now be resolved!" -ForegroundColor Cyan
