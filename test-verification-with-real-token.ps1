# Script để test với token thực từ database
Write-Host "🧪 Testing email verification with real token..." -ForegroundColor Yellow

# Lấy token từ database
Write-Host "`n🔍 Getting verification token from database..." -ForegroundColor Blue

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

$getTokenSQL | Out-File -FilePath "get_latest_token.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: get_latest_token.sql" -ForegroundColor Green

# Chạy script SQL để lấy token
Write-Host "`n🔍 Running SQL query to get token..." -ForegroundColor Blue
try {
    $tokenResult = mysql -u root -p -e "USE movietickets; $getTokenSQL" 2>$null
    if ($tokenResult) {
        $lines = $tokenResult -split "`n"
        if ($lines.Count -gt 1) {
            $tokenLine = $lines[1] # Skip header row
            $tokenParts = $tokenLine -split "`t"
            if ($tokenParts.Count -ge 2) {
                $token = $tokenParts[1].Trim()
                $email = $tokenParts[3].Trim()
                Write-Host "✅ Found token: $token" -ForegroundColor Green
                Write-Host "📧 For email: $email" -ForegroundColor Cyan
                
                # Tạo test URL
                $testUrl = "http://localhost:5173/verify-email?token=$token"
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
                Write-Host "[EmailVerification] Token from URL: $token" -ForegroundColor Cyan
                Write-Host "[EmailVerification] Auto-verifying token from URL..." -ForegroundColor Cyan
                Write-Host "[EmailVerification] handleVerifyEmail called with token: $token" -ForegroundColor Cyan
                Write-Host "[EmailVerification] Setting status to verifying..." -ForegroundColor Cyan
                Write-Host "[EmailVerification] API response: ..." -ForegroundColor Cyan
                Write-Host "[EmailVerification] Verification successful! Setting success status..." -ForegroundColor Cyan
                Write-Host "[EmailVerification] Success status set, no auto-redirect" -ForegroundColor Cyan
                
            } else {
                Write-Host "❌ Could not parse token from result" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No token found in database" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to get token from database" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting token: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run manually: mysql -u root -p < get_latest_token.sql" -ForegroundColor Cyan
}

Write-Host "`n🏁 Test script completed" -ForegroundColor Green
