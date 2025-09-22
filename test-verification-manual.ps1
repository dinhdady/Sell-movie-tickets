# Script để test email verification với token giả
Write-Host "🧪 Testing email verification with manual token..." -ForegroundColor Yellow

# Test với token giả
$testToken = "ac7115e6-7b4e-4110-8b57-6f7a6e0a2ef7"
$testUrl = "http://localhost:5173/verify-email?token=$testToken"

Write-Host "`n🌐 Test URL: $testUrl" -ForegroundColor Cyan

# Mở URL trong browser
Write-Host "`n🌐 Opening verification URL in browser..." -ForegroundColor Blue
Start-Process $testUrl

Write-Host "`n📋 Expected behavior:" -ForegroundColor Blue
Write-Host "1. Page should load with token from URL" -ForegroundColor White
Write-Host "2. Should show 'Đang xác thực email...' message" -ForegroundColor White
Write-Host "3. Should show success message with green checkmark" -ForegroundColor White
Write-Host "4. Should show 'Tiếp tục đăng nhập' button" -ForegroundColor White
Write-Host "5. Should show 'Về trang chủ' button" -ForegroundColor White
Write-Host "6. Should NOT automatically redirect to login" -ForegroundColor White

Write-Host "`n🔍 Debug steps:" -ForegroundColor Blue
Write-Host "1. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "2. Go to Console tab" -ForegroundColor White
Write-Host "3. Check console logs for EmailVerification messages" -ForegroundColor White
Write-Host "4. Check if verificationStatus changes to 'success'" -ForegroundColor White
Write-Host "5. Check if success UI is rendered" -ForegroundColor White
Write-Host "6. Check if there's a redirect after success" -ForegroundColor White

Write-Host "`n🎯 Key console logs to look for:" -ForegroundColor Blue
Write-Host "[EmailVerification] Token from URL: $testToken" -ForegroundColor Cyan
Write-Host "[EmailVerification] Auto-verifying token from URL..." -ForegroundColor Cyan
Write-Host "[EmailVerification] handleVerifyEmail called with token: $testToken" -ForegroundColor Cyan
Write-Host "[EmailVerification] Setting status to verifying..." -ForegroundColor Cyan
Write-Host "[EmailVerification] API response: ..." -ForegroundColor Cyan
Write-Host "[EmailVerification] Verification successful! Setting success status..." -ForegroundColor Cyan
Write-Host "[EmailVerification] Success status set, no auto-redirect" -ForegroundColor Cyan

Write-Host "`n🔍 Test URLs:" -ForegroundColor Blue
Write-Host "With token: $testUrl" -ForegroundColor Cyan
Write-Host "Without token: http://localhost:5173/verify-email" -ForegroundColor Cyan
Write-Host "With invalid token: http://localhost:5173/verify-email?token=invalid" -ForegroundColor Cyan

Write-Host "`n🏁 Test script completed" -ForegroundColor Green
