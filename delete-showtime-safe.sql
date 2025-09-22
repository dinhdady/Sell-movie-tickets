-- Script để xóa showtime an toàn
-- Chạy script này trong MySQL để xóa dữ liệu theo thứ tự đúng

-- 1. Xóa tất cả ShowtimeSeatBooking trước
DELETE FROM showtime_seat_bookings WHERE showtime_id = ?;

-- 2. Xóa tất cả Tickets liên quan
DELETE t FROM tickets t
JOIN orders o ON t.order_id = o.id
JOIN bookings b ON o.id = b.order_id
WHERE b.showtime_id = ?;

-- 3. Xóa tất cả Orders liên quan
DELETE o FROM orders o
JOIN bookings b ON o.id = b.order_id
WHERE b.showtime_id = ?;

-- 4. Xóa tất cả Bookings liên quan
DELETE FROM bookings WHERE showtime_id = ?;

-- 5. Cuối cùng xóa Showtime
DELETE FROM showtimes WHERE id = ?;

-- Kiểm tra kết quả
SELECT 'showtime_seat_bookings' as table_name, COUNT(*) as count FROM showtime_seat_bookings WHERE showtime_id = ?
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings WHERE showtime_id = ?
UNION ALL
SELECT 'orders', COUNT(*) FROM orders o JOIN bookings b ON o.id = b.order_id WHERE b.showtime_id = ?
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets t JOIN orders o ON t.order_id = o.id JOIN bookings b ON o.id = b.order_id WHERE b.showtime_id = ?
UNION ALL
SELECT 'showtimes', COUNT(*) FROM showtimes WHERE id = ?;
