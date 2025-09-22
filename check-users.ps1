# Script để kiểm tra users trong database
Write-Host "🔍 Checking users in database..." -ForegroundColor Yellow

# Tạo SQL script để kiểm tra users
$checkUsersSQL = @"
SELECT id, username, email, role, is_active, is_email_verified FROM users LIMIT 10;
"@

$checkUsersSQL | Out-File -FilePath "check_users.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: check_users.sql" -ForegroundColor Green
Write-Host "Run: mysql -u root -p < check_users.sql" -ForegroundColor Cyan

Write-Host "`n🔍 Alternative: Test với user đã đăng ký..." -ForegroundColor Blue

# Thử đăng nhập với user vừa đăng ký (nếu đã verify email)
$loginData = @{
    username = "testuser487"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ User login successful!" -ForegroundColor Green
    $token = $loginResponse.object.accessToken
    $userId = $loginResponse.object.user.id
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host "User ID: $userId" -ForegroundColor Cyan
} catch {
    Write-Host "❌ User login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "User may need email verification" -ForegroundColor Yellow
}

Write-Host "`n🏁 User check completed" -ForegroundColor Green
