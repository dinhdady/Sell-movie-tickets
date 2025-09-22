-- Kiểm tra cấu trúc bảng email_verification_tokens
DESCRIBE email_verification_tokens;

-- Kiểm tra cấu trúc bảng users
DESCRIBE users;

-- Kiểm tra dữ liệu mẫu
SELECT id, username, email, is_email_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
