-- Kiểm tra movies table
SELECT 'Movies count:' as info, COUNT(*) as count FROM movies;

-- Kiểm tra movie ID 1
SELECT 'Movie ID 1:' as info, id, title, status FROM movies WHERE id = 1;

-- Kiểm tra showtimes tham chiếu movie ID 1
SELECT 'Showtimes referencing movie ID 1:' as info, COUNT(*) as count 
FROM showtimes WHERE movie_id = 1;

-- Kiểm tra bookings tham chiếu movie ID 1 (qua showtimes)
SELECT 'Bookings referencing movie ID 1:' as info, COUNT(*) as count 
FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
WHERE s.movie_id = 1;

-- Hiển thị chi tiết showtimes tham chiếu movie ID 1
SELECT 'Showtime details:' as info, s.id, s.movie_id, s.start_time, s.end_time
FROM showtimes s 
WHERE s.movie_id = 1;

-- Hiển thị chi tiết bookings tham chiếu movie ID 1
SELECT 'Booking details:' as info, b.id, b.customer_name, b.customer_email, s.movie_id
FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
WHERE s.movie_id = 1;
