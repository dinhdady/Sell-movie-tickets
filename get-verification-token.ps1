# Script để lấy verification token từ database
Write-Host "🔍 Getting verification token from database..." -ForegroundColor Yellow

# Tạo script SQL để lấy token mới nhất
$getTokenSQL = @"
-- Lấy token verification mới nhất
SELECT 
    e.id,
    e.token,
    e.user_id,
    u.email,
    u.username,
    e.expiry_date,
    e.created_at,
    e.is_used
FROM email_verification_tokens e
JOIN users u ON e.user_id = u.id
WHERE e.is_used = FALSE 
  AND e.expiry_date > NOW()
ORDER BY e.created_at DESC
LIMIT 1;
"@

# Lưu script SQL
$getTokenSQL | Out-File -FilePath "get_verification_token.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: get_verification_token.sql" -ForegroundColor Green

# Tạo script để test với token thực
$testWithToken = @"
# Script để test với token thực từ database
Write-Host "🧪 Testing with real verification token..." -ForegroundColor Yellow

# Thay YOUR_TOKEN_HERE bằng token thực từ database
`$token = "YOUR_TOKEN_HERE"

if (`$token -eq "YOUR_TOKEN_HERE") {
    Write-Host "⚠️ Please replace YOUR_TOKEN_HERE with actual token from database" -ForegroundColor Yellow
    Write-Host "Run: mysql -u root -p < get_verification_token.sql" -ForegroundColor Cyan
    exit 1
}

# Test URL với token thực
`$testUrl = "http://localhost:5173/verify-email?token=`$token"
Write-Host "Test URL: `$testUrl" -ForegroundColor Cyan

# Mở URL trong browser
Write-Host "`n🌐 Opening verification URL in browser..." -ForegroundColor Blue
Start-Process `$testUrl

Write-Host "`n📋 Expected behavior:" -ForegroundColor Blue
Write-Host "1. Page should load automatically" -ForegroundColor White
Write-Host "2. Should show 'Đang xác thực email...' message" -ForegroundColor White
Write-Host "3. Should show success message with green checkmark" -ForegroundColor White
Write-Host "4. Should show 'Tiếp tục đăng nhập' button" -ForegroundColor White
Write-Host "5. Should show 'Về trang chủ' button" -ForegroundColor White
Write-Host "6. Should hide navigation links" -ForegroundColor White

Write-Host "`n🏁 Token test ready" -ForegroundColor Green
"@

$testWithToken | Out-File -FilePath "test-with-real-token.ps1" -Encoding UTF8

Write-Host "📝 Created test script: test-with-real-token.ps1" -ForegroundColor Green

Write-Host "`n🔧 Steps to test with real token:" -ForegroundColor Blue
Write-Host "1. Run: mysql -u root -p < get_verification_token.sql" -ForegroundColor White
Write-Host "2. Copy the token from the result" -ForegroundColor White
Write-Host "3. Edit test-with-real-token.ps1 and replace YOUR_TOKEN_HERE" -ForegroundColor White
Write-Host "4. Run: .\test-with-real-token.ps1" -ForegroundColor White

Write-Host "`n🌐 Manual test URLs:" -ForegroundColor Blue
Write-Host "Base page: http://localhost:5173/verify-email" -ForegroundColor Cyan
Write-Host "With token: http://localhost:5173/verify-email?token=YOUR_TOKEN" -ForegroundColor Cyan

Write-Host "`n📋 Database query to get token:" -ForegroundColor Blue
Write-Host "mysql -u root -p" -ForegroundColor White
Write-Host "USE movietickets;" -ForegroundColor White
Write-Host "source get_verification_token.sql;" -ForegroundColor White

Write-Host "`n🏁 Token retrieval scripts ready" -ForegroundColor Green
