# Script để debug vấn đề tự động redirect trong email verification
Write-Host "🔍 Debugging email verification redirect issue..." -ForegroundColor Yellow

# Test 1: Đăng ký user mới để lấy token
Write-Host "`n🔍 Test 1: Registering new user to get verification token..." -ForegroundColor Blue
$registerData = @{
    username = "debugtest$(Get-Random -Maximum 1000)"
    email = "debugtest$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "Debug Test User"
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

# Test 2: Lấy token từ database
Write-Host "`n🔍 Test 2: Getting verification token from database..." -ForegroundColor Blue
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

$getTokenSQL | Out-File -FilePath "debug_get_token.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: debug_get_token.sql" -ForegroundColor Green
Write-Host "Run: mysql -u root -p < debug_get_token.sql" -ForegroundColor Cyan

# Test 3: Test với token thực
Write-Host "`n🔍 Test 3: Testing with real token..." -ForegroundColor Blue
Write-Host "After getting token from database, test these URLs:" -ForegroundColor Cyan
Write-Host "1. http://localhost:5173/verify-email?token=YOUR_TOKEN_HERE" -ForegroundColor White
Write-Host "2. http://localhost:5173/verify-email (without token)" -ForegroundColor White

Write-Host "`n🔍 Debug steps:" -ForegroundColor Blue
Write-Host "1. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "2. Go to Console tab" -ForegroundColor White
Write-Host "3. Visit verification URL with token" -ForegroundColor White
Write-Host "4. Check console logs for:" -ForegroundColor White
Write-Host "   - [EmailVerification] Token from URL: ..." -ForegroundColor Cyan
Write-Host "   - [EmailVerification] Auto-verifying token from URL..." -ForegroundColor Cyan
Write-Host "   - [EmailVerification] handleVerifyEmail called with token: ..." -ForegroundColor Cyan
Write-Host "   - [EmailVerification] Setting status to verifying..." -ForegroundColor Cyan
Write-Host "   - [EmailVerification] API response: ..." -ForegroundColor Cyan
Write-Host "   - [EmailVerification] Verification successful! Setting success status..." -ForegroundColor Cyan
Write-Host "   - [EmailVerification] Success status set, no auto-redirect" -ForegroundColor Cyan

Write-Host "`n🔍 Check for redirect causes:" -ForegroundColor Blue
Write-Host "1. Check if AuthContext is causing redirect" -ForegroundColor White
Write-Host "2. Check if ProtectedRoute is causing redirect" -ForegroundColor White
Write-Host "3. Check if Header component is causing redirect" -ForegroundColor White
Write-Host "4. Check if there's a useEffect with navigate()" -ForegroundColor White

Write-Host "`n🔍 Expected behavior:" -ForegroundColor Blue
Write-Host "1. Page should load with token from URL" -ForegroundColor White
Write-Host "2. Should show 'Đang xác thực email...' message" -ForegroundColor White
Write-Host "3. Should show success message with green checkmark" -ForegroundColor White
Write-Host "4. Should show 'Tiếp tục đăng nhập' button" -ForegroundColor White
Write-Host "5. Should show 'Về trang chủ' button" -ForegroundColor White
Write-Host "6. Should NOT automatically redirect to login" -ForegroundColor White

Write-Host "`n🔍 Common redirect causes:" -ForegroundColor Blue
Write-Host "1. AuthContext useEffect with navigate()" -ForegroundColor White
Write-Host "2. ProtectedRoute redirecting authenticated users" -ForegroundColor White
Write-Host "3. Header component redirecting after login" -ForegroundColor White
Write-Host "4. App.tsx redirect logic" -ForegroundColor White
Write-Host "5. Browser history manipulation" -ForegroundColor White

Write-Host "`n🔍 Debug checklist:" -ForegroundColor Blue
Write-Host "✅ Check console logs for EmailVerification messages" -ForegroundColor Green
Write-Host "✅ Check if verificationStatus changes to 'success'" -ForegroundColor Green
Write-Host "✅ Check if success UI is rendered" -ForegroundColor Green
Write-Host "✅ Check if there's a redirect after success" -ForegroundColor Green
Write-Host "✅ Check AuthContext for auto-redirect logic" -ForegroundColor Green
Write-Host "✅ Check ProtectedRoute for redirect logic" -ForegroundColor Green

Write-Host "`n🏁 Debug script completed" -ForegroundColor Green
