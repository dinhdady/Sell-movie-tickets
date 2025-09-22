USE movietickets;

-- Tạo movie ID 1 nếu không tồn tại
INSERT IGNORE INTO movies (id, title, description, director, duration, genre, language, film_rating, price, rating, release_date, status, created_at, updated_at)
VALUES (1, 'Movie Placeholder', 'This is a placeholder movie for fixing reference errors', 'Unknown Director', 120, 'Action', 'Vietnamese', 'PG13', 50000, 7.0, '2024-01-01', 'NOW_SHOWING', NOW(), NOW());

-- Kiểm tra kết quả
SELECT 'Fix completed - Movie ID 1:' as info, id, title, status FROM movies WHERE id = 1;

-- Kiểm tra showtimes tham chiếu movie ID 1
SELECT 'Showtimes referencing movie ID 1:' as info, COUNT(*) as count FROM showtimes WHERE movie_id = 1;

-- Kiểm tra bookings tham chiếu movie ID 1
SELECT 'Bookings referencing movie ID 1:' as info, COUNT(*) as count 
FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
WHERE s.movie_id = 1;
