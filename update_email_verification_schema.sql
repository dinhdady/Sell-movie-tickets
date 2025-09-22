-- Tạo bảng email_verification_tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(8) NOT NULL,
    expiry_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date)
);

-- Thêm cột is_email_verified vào bảng users nếu chưa có
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Cập nhật tất cả user hiện tại thành đã verify (để không ảnh hưởng đến user cũ)
UPDATE users 
SET is_email_verified = TRUE 
WHERE is_email_verified IS NULL OR is_email_verified = FALSE;

-- Hiển thị kết quả
SELECT 'Database schema updated successfully' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as verified_users FROM users WHERE is_email_verified = TRUE;
SELECT COUNT(*) as unverified_users FROM users WHERE is_email_verified = FALSE;
