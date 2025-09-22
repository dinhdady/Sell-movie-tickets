# Script để test chức năng xác thực qua link
Write-Host "🔗 Testing email verification via link..." -ForegroundColor Yellow

# Test 1: Đăng ký user mới để lấy token
Write-Host "`n🔍 Test 1: Registering new user to get verification token..." -ForegroundColor Blue
$registerData = @{
    username = "linktest$(Get-Random -Maximum 1000)"
    email = "linktest$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "Link Test User"
    phone = "0123456789"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Email: $($registerResponse.object.email)" -ForegroundColor Cyan
    Write-Host "Verification required: $($registerResponse.object.verificationRequired)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Lấy token từ database (giả lập)
Write-Host "`n🔍 Test 2: Simulating email verification link..." -ForegroundColor Blue
Write-Host "In a real scenario, the user would receive an email with a link like:" -ForegroundColor Cyan
Write-Host "http://localhost:5173/verify-email?token=VERIFICATION_TOKEN_HERE" -ForegroundColor White

# Test 3: Test với token hợp lệ (giả lập)
Write-Host "`n🔍 Test 3: Testing with valid token..." -ForegroundColor Blue
Write-Host "To test the link functionality:" -ForegroundColor Cyan
Write-Host "1. Check the application logs for the verification token" -ForegroundColor White
Write-Host "2. Or check the database for the token" -ForegroundColor White
Write-Host "3. Visit: http://localhost:5173/verify-email?token=YOUR_TOKEN_HERE" -ForegroundColor White

# Test 4: Test với token không hợp lệ
Write-Host "`n🔍 Test 4: Testing with invalid token via link..." -ForegroundColor Blue
Write-Host "Visit: http://localhost:5173/verify-email?token=invalid-token-123" -ForegroundColor White
Write-Host "Expected: Should show error message and resend option" -ForegroundColor Cyan

# Test 5: Test với token rỗng
Write-Host "`n🔍 Test 5: Testing with empty token via link..." -ForegroundColor Blue
Write-Host "Visit: http://localhost:5173/verify-email?token=" -ForegroundColor White
Write-Host "Expected: Should show form to enter token manually" -ForegroundColor Cyan

Write-Host "`n🌐 Frontend test URLs:" -ForegroundColor Blue
Write-Host "Base verification page: http://localhost:5173/verify-email" -ForegroundColor Cyan
Write-Host "With invalid token: http://localhost:5173/verify-email?token=invalid" -ForegroundColor Cyan
Write-Host "With empty token: http://localhost:5173/verify-email?token=" -ForegroundColor Cyan

Write-Host "`n📋 Expected behavior:" -ForegroundColor Blue
Write-Host "1. When clicking verification link with valid token:" -ForegroundColor White
Write-Host "   - Should automatically verify email" -ForegroundColor Green
Write-Host "   - Should show success message with green checkmark" -ForegroundColor Green
Write-Host "   - Should show 'Tiếp tục đăng nhập' button" -ForegroundColor Green
Write-Host "   - Should show 'Về trang chủ' button" -ForegroundColor Green
Write-Host "   - Should hide navigation links" -ForegroundColor Green

Write-Host "`n2. When clicking verification link with invalid token:" -ForegroundColor White
Write-Host "   - Should show error message" -ForegroundColor Red
Write-Host "   - Should show resend verification option" -ForegroundColor Red
Write-Host "   - Should show manual token input form" -ForegroundColor Red

Write-Host "`n3. When visiting without token:" -ForegroundColor White
Write-Host "   - Should show manual token input form" -ForegroundColor Yellow
Write-Host "   - Should show resend verification option" -ForegroundColor Yellow

Write-Host "`n🎯 Key Features to Test:" -ForegroundColor Blue
Write-Host "✅ Automatic verification when token in URL" -ForegroundColor Green
Write-Host "✅ Success message with clear call-to-action" -ForegroundColor Green
Write-Host "✅ Navigation buttons (Login, Home)" -ForegroundColor Green
Write-Host "✅ Error handling for invalid tokens" -ForegroundColor Green
Write-Host "✅ Manual token input fallback" -ForegroundColor Green
Write-Host "✅ Resend verification option" -ForegroundColor Green

Write-Host "`n📧 Email Template Check:" -ForegroundColor Blue
Write-Host "The verification email should contain:" -ForegroundColor White
Write-Host "- Clear subject: 'Xác thực tài khoản - Cinema Movie Tickets'" -ForegroundColor Cyan
Write-Host "- Verification link: http://localhost:5173/verify-email?token=TOKEN" -ForegroundColor Cyan
Write-Host "- Manual token: The actual token string" -ForegroundColor Cyan
Write-Host "- Expiry notice: Token expires in 24 hours" -ForegroundColor Cyan

Write-Host "`n🏁 Email verification link test completed" -ForegroundColor Green
