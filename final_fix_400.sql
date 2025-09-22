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
    '.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', -- password: password
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
