-- Script để cập nhật cột description thành LONGTEXT
-- Chạy script này để cập nhật database hiện tại

USE movietickets;

-- Cập nhật cột description thành LONGTEXT
ALTER TABLE movies 
MODIFY COLUMN description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiểm tra kết quả
DESCRIBE movies;

-- Hiển thị thông tin về cột description
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'movietickets' 
  AND TABLE_NAME = 'movies' 
  AND COLUMN_NAME = 'description';
