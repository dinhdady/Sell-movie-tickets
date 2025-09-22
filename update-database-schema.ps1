# Script để cập nhật database schema cho email verification
Write-Host "🗄️ Updating database schema for email verification..." -ForegroundColor Yellow

# Tạo script SQL để thêm bảng email_verification_tokens
$sqlScript = @"
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
"@

# Lưu script SQL
$sqlScript | Out-File -FilePath "update_email_verification_schema.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: update_email_verification_schema.sql" -ForegroundColor Green

# Tạo script để kiểm tra database
$checkScript = @"
-- Kiểm tra cấu trúc bảng email_verification_tokens
DESCRIBE email_verification_tokens;

-- Kiểm tra cấu trúc bảng users
DESCRIBE users;

-- Kiểm tra dữ liệu mẫu
SELECT id, username, email, is_email_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
"@

$checkScript | Out-File -FilePath "check_email_verification_schema.sql" -Encoding UTF8

Write-Host "📝 Created check script: check_email_verification_schema.sql" -ForegroundColor Green

Write-Host "`n🔧 Manual database update instructions:" -ForegroundColor Blue
Write-Host "1. Open MySQL command line or MySQL Workbench" -ForegroundColor White
Write-Host "2. Run: source update_email_verification_schema.sql" -ForegroundColor Cyan
Write-Host "3. Verify: source check_email_verification_schema.sql" -ForegroundColor Cyan

Write-Host "`n📋 Quick commands:" -ForegroundColor Yellow
Write-Host "mysql -u root -p" -ForegroundColor White
Write-Host "USE movietickets;" -ForegroundColor White
Write-Host "source update_email_verification_schema.sql;" -ForegroundColor White

Write-Host "`n🌐 After updating database:" -ForegroundColor Blue
Write-Host "1. Restart Spring Boot application" -ForegroundColor White
Write-Host "2. Test email verification functionality" -ForegroundColor White
Write-Host "3. Run: .\test-email-verification.ps1" -ForegroundColor White

Write-Host "`n⚠️  Important notes:" -ForegroundColor Yellow
Write-Host "- All existing users will be marked as verified" -ForegroundColor White
Write-Host "- New users will need email verification" -ForegroundColor White
Write-Host "- Email verification tokens expire after 24 hours" -ForegroundColor White

Write-Host "`n🏁 Database schema update scripts ready" -ForegroundColor Green
