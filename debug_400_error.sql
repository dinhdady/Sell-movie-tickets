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
