-- Xóa orphaned bookings (bookings tham chiếu movie không tồn tại)
DELETE b FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
LEFT JOIN movies m ON s.movie_id = m.id 
WHERE m.id IS NULL;

-- Xóa orphaned showtimes (showtimes tham chiếu movie không tồn tại)
DELETE s FROM showtimes s 
LEFT JOIN movies m ON s.movie_id = m.id 
WHERE m.id IS NULL;

-- Xóa orphaned tickets (tickets tham chiếu booking không tồn tại)
DELETE t FROM tickets t 
LEFT JOIN bookings b ON t.order_id = b.order_id 
WHERE b.id IS NULL;

-- Xóa orphaned orders (orders tham chiếu booking không tồn tại)
DELETE o FROM orders o 
LEFT JOIN bookings b ON o.id = b.order_id 
WHERE b.id IS NULL;
