# Script đơn giản để sửa lỗi 400 Bad Request
Write-Host "🔧 Simple fix for 400 Bad Request error..." -ForegroundColor Yellow

# Tạo SQL script đơn giản
$sqlScript = @"
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

# Lưu SQL script
$sqlScript | Out-File -FilePath "simple_fix_400.sql" -Encoding UTF8

Write-Host "📝 Created simple_fix_400.sql" -ForegroundColor Green

Write-Host "`n🔍 Manual steps to fix 400 error:" -ForegroundColor Yellow
Write-Host "1. Open MySQL command line:" -ForegroundColor Cyan
Write-Host "   mysql -u root -p" -ForegroundColor White
Write-Host "2. Run the SQL script:" -ForegroundColor Cyan
Write-Host "   source simple_fix_400.sql;" -ForegroundColor White
Write-Host "3. Or copy-paste the SQL content below:" -ForegroundColor Cyan

Write-Host "`n📋 SQL Content:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host $sqlScript -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "`n🎯 What this fixes:" -ForegroundColor Yellow
Write-Host "✅ Creates showtime ID 6 for movie ID 7" -ForegroundColor Green
Write-Host "✅ Creates seat IDs 1 and 2 for room ID 1" -ForegroundColor Green
Write-Host "✅ Sets proper status and pricing" -ForegroundColor Green
Write-Host "✅ Prevents duplicate key errors" -ForegroundColor Green

Write-Host "`n🚀 After running the SQL script:" -ForegroundColor Yellow
Write-Host "1. The 400 Bad Request error should be fixed" -ForegroundColor Cyan
Write-Host "2. You can now book with showtime ID 6" -ForegroundColor Cyan
Write-Host "3. Seats 1 and 2 will be available" -ForegroundColor Cyan
Write-Host "4. Order creation should work properly" -ForegroundColor Cyan

Write-Host "`n🏁 Simple fix script created!" -ForegroundColor Green
