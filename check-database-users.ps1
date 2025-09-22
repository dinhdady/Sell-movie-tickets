# Script để kiểm tra users trong database
Write-Host "👥 Checking users in database..." -ForegroundColor Yellow

# Tạo script SQL để kiểm tra users
$checkUsersSQL = @"
-- Kiểm tra tất cả users
SELECT id, username, email, is_email_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- Kiểm tra số lượng users
SELECT COUNT(*) as total_users FROM users;

-- Kiểm tra users chưa verify email
SELECT COUNT(*) as unverified_users FROM users WHERE is_email_verified = FALSE;

-- Kiểm tra users đã verify email
SELECT COUNT(*) as verified_users FROM users WHERE is_email_verified = TRUE;
"@

# Lưu script SQL
$checkUsersSQL | Out-File -FilePath "check_users.sql" -Encoding UTF8

Write-Host "📝 Created check script: check_users.sql" -ForegroundColor Green

# Tạo script để test API
$testAPI = @"
# Test API để kiểm tra users
Write-Host "🔍 Testing user API..." -ForegroundColor Blue

try {
    # Lấy danh sách users (cần admin token)
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/user/admin/all" -Method GET
    Write-Host "✅ Users retrieved successfully!" -ForegroundColor Green
    Write-Host "Total users: $($response.object.Count)" -ForegroundColor Cyan
    
    foreach ($user in $response.object) {
        Write-Host "  - $($user.username) ($($user.email)) - Verified: $($user.isEmailVerified)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error retrieving users: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be because you need admin authentication" -ForegroundColor Yellow
}
"@

$testAPI | Out-File -FilePath "test-user-api.ps1" -Encoding UTF8

Write-Host "📝 Created API test script: test-user-api.ps1" -ForegroundColor Green

Write-Host "`n🔧 Manual database check:" -ForegroundColor Blue
Write-Host "mysql -u root -p" -ForegroundColor White
Write-Host "USE movietickets;" -ForegroundColor White
Write-Host "source check_users.sql;" -ForegroundColor White

Write-Host "`n🔧 API test:" -ForegroundColor Blue
Write-Host ".\test-user-api.ps1" -ForegroundColor White

Write-Host "`n📋 Expected results:" -ForegroundColor Blue
Write-Host "1. Should see all users in database" -ForegroundColor White
Write-Host "2. Should see email verification status" -ForegroundColor White
Write-Host "3. Should see creation dates" -ForegroundColor White

Write-Host "`n🏁 Database check scripts ready" -ForegroundColor Green
