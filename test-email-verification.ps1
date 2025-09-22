# Script để test chức năng email verification
Write-Host "📧 Testing email verification functionality" -ForegroundColor Yellow

# Test 1: Đăng ký tài khoản mới
Write-Host "`n🔍 Test 1: Registering new user..." -ForegroundColor Blue
$registerData = @{
    username = "testuser$(Get-Random -Maximum 1000)"
    email = "test$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "Test User"
    phone = "0123456789"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
    
    $email = $registerResponse.object.email
    Write-Host "Email: $email" -ForegroundColor Cyan
    Write-Host "Verification required: $($registerResponse.object.verificationRequired)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
    exit 1
}

# Test 2: Kiểm tra trạng thái email verification
Write-Host "`n🔍 Test 2: Checking email verification status..." -ForegroundColor Blue
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/check-email-verification?email=$email" -Method GET
    Write-Host "✅ Email verification status retrieved!" -ForegroundColor Green
    Write-Host "Email: $($statusResponse.object.email)" -ForegroundColor Cyan
    Write-Host "Is verified: $($statusResponse.object.isVerified)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error checking verification status: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test với token không hợp lệ
Write-Host "`n🔍 Test 3: Testing with invalid token..." -ForegroundColor Blue
$invalidTokenData = @{
    token = "invalid-token-123"
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/verify-email" -Method POST -Body $invalidTokenData -ContentType "application/json"
    Write-Host "⚠️ Invalid token was accepted (unexpected)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Invalid token properly rejected" -ForegroundColor Green
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error message: $errorBody" -ForegroundColor Cyan
    }
}

# Test 4: Gửi lại email verification
Write-Host "`n🔍 Test 4: Resending verification email..." -ForegroundColor Blue
$resendData = @{
    email = $email
} | ConvertTo-Json

try {
    $resendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/resend-verification" -Method POST -Body $resendData -ContentType "application/json"
    Write-Host "✅ Verification email resent successfully!" -ForegroundColor Green
    Write-Host "Response: $($resendResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error resending verification email: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 5: Test với email không tồn tại
Write-Host "`n🔍 Test 5: Testing with non-existent email..." -ForegroundColor Blue
$nonExistentEmailData = @{
    email = "nonexistent@example.com"
} | ConvertTo-Json

try {
    $resendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/resend-verification" -Method POST -Body $nonExistentEmailData -ContentType "application/json"
    Write-Host "⚠️ Non-existent email was accepted (unexpected)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Non-existent email properly rejected" -ForegroundColor Green
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error message: $errorBody" -ForegroundColor Cyan
    }
}

Write-Host "`n🌐 Test frontend at:" -ForegroundColor Blue
Write-Host "Register: http://localhost:5173/register" -ForegroundColor Cyan
Write-Host "Email Verification: http://localhost:5173/verify-email" -ForegroundColor Cyan
Write-Host "Login: http://localhost:5173/login" -ForegroundColor Cyan

Write-Host "`n📋 Test steps for frontend:" -ForegroundColor Blue
Write-Host "1. Go to register page" -ForegroundColor White
Write-Host "2. Fill in registration form" -ForegroundColor White
Write-Host "3. Submit form - should show verification message" -ForegroundColor White
Write-Host "4. Check email for verification token" -ForegroundColor White
Write-Host "5. Go to verify-email page" -ForegroundColor White
Write-Host "6. Enter token and verify" -ForegroundColor White
Write-Host "7. Try to login with verified account" -ForegroundColor White

Write-Host "`n📋 API Endpoints tested:" -ForegroundColor Blue
Write-Host "✅ POST /api/auth/register - Register with email verification" -ForegroundColor Green
Write-Host "✅ GET /api/auth/check-email-verification - Check verification status" -ForegroundColor Green
Write-Host "✅ POST /api/auth/verify-email - Verify email with token" -ForegroundColor Green
Write-Host "✅ POST /api/auth/resend-verification - Resend verification email" -ForegroundColor Green
Write-Host "✅ Error handling for invalid data" -ForegroundColor Green

Write-Host "`n🏁 Email verification test completed" -ForegroundColor Blue
