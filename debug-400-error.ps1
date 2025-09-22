# Script để debug lỗi 400 Bad Request khi thanh toán
Write-Host "🔍 Debugging 400 Bad Request error..." -ForegroundColor Yellow

# 1. Tạo SQL script để kiểm tra dữ liệu
$debugSql = @"
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
    s.status
FROM showtimes s
LEFT JOIN movies m ON s.movie_id = m.id
LEFT JOIN rooms r ON s.room_id = r.id
LEFT JOIN cinemas c ON r.cinema_id = c.id
WHERE s.id = 6;

-- Kiểm tra order ID 308
SELECT 'CHECKING ORDER ID 308:' as status;
SELECT 
    o.id,
    o.user_id,
    o.txn_ref,
    o.total_price,
    o.status,
    o.customer_email,
    o.created_at
FROM orders o
WHERE o.id = 308;

-- Kiểm tra seats ID 1 và 2
SELECT 'CHECKING SEATS ID 1 AND 2:' as status;
SELECT 
    s.id,
    s.seat_number,
    s.row_number,
    s.column_number,
    s.seat_type,
    s.room_id,
    r.name as room_name
FROM seats s
LEFT JOIN rooms r ON s.room_id = r.id
WHERE s.id IN (1, 2);

-- Kiểm tra user ID f4275930
SELECT 'CHECKING USER ID f4275930:' as status;
SELECT 
    u.id,
    u.username,
    u.email,
    u.is_active,
    u.email_verified
FROM users u
WHERE u.id = 'f4275930';

-- Kiểm tra showtime seat bookings cho showtime 6
SELECT 'CHECKING SHOWTIME SEAT BOOKINGS FOR SHOWTIME 6:' as status;
SELECT 
    ssb.id,
    ssb.showtime_id,
    ssb.seat_id,
    ssb.booking_id,
    ssb.status,
    s.seat_number
FROM showtime_seat_bookings ssb
LEFT JOIN seats s ON ssb.seat_id = s.id
WHERE ssb.showtime_id = 6;
"@

$debugSql | Out-File -FilePath "debug_400_error.sql" -Encoding UTF8

# 2. Tạo script để sửa lỗi
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

$fixSql | Out-File -FilePath "fix_400_error.sql" -Encoding UTF8

# 3. Tạo script test API
$testScript = @"
# Test API sau khi sửa lỗi
Write-Host "🧪 Testing API after fix..." -ForegroundColor Yellow

try {
    # Login
    `$loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    `$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body `$loginData -ContentType "application/json"
    `$token = `$loginResponse.object.accessToken
    `$user = `$loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: `$(`$user.id)" -ForegroundColor Cyan

    `$headers = @{
        "Authorization" = "Bearer `$token"
        "Content-Type" = "application/json"
    }

    # Test 1: Kiểm tra showtime ID 6
    Write-Host "`n🔍 Test 1: Checking showtime ID 6..." -ForegroundColor Blue
    try {
        `$showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method Get -Headers `$headers
        Write-Host "✅ Showtime ID 6 found:" -ForegroundColor Green
        Write-Host "   Movie ID: `$(`$showtimeResponse.object.movie_id)" -ForegroundColor Cyan
        Write-Host "   Room ID: `$(`$showtimeResponse.object.room_id)" -ForegroundColor Cyan
        Write-Host "   Status: `$(`$showtimeResponse.object.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Showtime ID 6 not found: `$(`$_.Exception.Message)" -ForegroundColor Red
    }

    # Test 2: Tạo order mới
    Write-Host "`n🔍 Test 2: Creating new order..." -ForegroundColor Blue
    try {
        `$orderData = @{
            userId = `$user.id
            showtimeId = 6
            totalPrice = 360000
            customerEmail = "test@example.com"
            customerName = "Test User"
            customerPhone = "0123456789"
            customerAddress = "Test Address"
        } | ConvertTo-Json

        `$orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body `$orderData -Headers `$headers
        Write-Host "✅ Order created successfully!" -ForegroundColor Green
        Write-Host "   Order ID: `$(`$orderResponse.object.id)" -ForegroundColor Cyan
        Write-Host "   TxnRef: `$(`$orderResponse.object.txnRef)" -ForegroundColor Cyan

        # Test 3: Tạo booking với order mới
        Write-Host "`n🔍 Test 3: Creating booking..." -ForegroundColor Blue
        `$bookingData = @{
            userId = `$user.id
            showtimeId = 6
            orderId = `$orderResponse.object.id
            totalPrice = 360000
            customerName = "Test User"
            customerEmail = "test@example.com"
            customerPhone = "0123456789"
            customerAddress = "Test Address"
            seatIds = @(1, 2)
        } | ConvertTo-Json

        `$bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body `$bookingData -Headers `$headers
        Write-Host "✅ Booking created successfully!" -ForegroundColor Green
        Write-Host "   Booking ID: `$(`$bookingResponse.object.id)" -ForegroundColor Cyan

    } catch {
        Write-Host "❌ Order/Booking creation failed: `$(`$_.Exception.Message)" -ForegroundColor Red
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

} catch {
    Write-Host "❌ Test failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}
"@

$testScript | Out-File -FilePath "test_after_fix.ps1" -Encoding UTF8

Write-Host "📝 Created debug scripts:" -ForegroundColor Green
Write-Host "  1. debug_400_error.sql - Kiểm tra dữ liệu gây lỗi 400" -ForegroundColor Cyan
Write-Host "  2. fix_400_error.sql - Sửa lỗi dữ liệu" -ForegroundColor Cyan
Write-Host "  3. test_after_fix.ps1 - Test API sau khi sửa" -ForegroundColor Cyan

Write-Host "`n🔍 Steps to fix 400 error:" -ForegroundColor Yellow
Write-Host "1. Run debug script to check data:" -ForegroundColor Cyan
Write-Host "   mysql -u root -p < debug_400_error.sql" -ForegroundColor White
Write-Host "2. Run fix script to create missing data:" -ForegroundColor Cyan
Write-Host "   mysql -u root -p < fix_400_error.sql" -ForegroundColor White
Write-Host "3. Test API after fix:" -ForegroundColor Cyan
Write-Host "   .\test_after_fix.ps1" -ForegroundColor White

Write-Host "`n🏁 Debug scripts created successfully!" -ForegroundColor Green
