-- Tạo movie ID 1 nếu không tồn tại
INSERT IGNORE INTO movies (id, title, description, director, duration, genre, language, film_rating, price, rating, release_date, status, created_at, updated_at)
VALUES (1, 'Movie Placeholder', 'This is a placeholder movie', 'Unknown Director', 120, 'Action', 'Vietnamese', 'PG13', 50000, 7.0, '2024-01-01', 'NOW_SHOWING', NOW(), NOW());

-- Cập nhật showtimes tham chiếu movie ID 1 để trỏ đến movie thực tế
-- (Chỉ thực hiện nếu có movie khác trong database)
UPDATE showtimes s 
JOIN movies m ON m.id = (SELECT id FROM movies WHERE id != 1 ORDER BY id LIMIT 1)
SET s.movie_id = m.id 
WHERE s.movie_id = 1;
