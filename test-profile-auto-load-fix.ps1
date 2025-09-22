# Test script để kiểm tra Profile page tự động load vé sau khi fix
Write-Host "🎬 Testing Profile Page Auto-Load Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

Write-Host "`n1. Testing API endpoints..." -ForegroundColor Yellow

# Test primary API
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ /api/tickets/test - Working ($($response.object.Count) tickets)" -ForegroundColor Green
    
    # Test filtering
    $testEmails = @("dinhhoang2207004@gmail.com", "hoangphuong16680@gmail.com")
    foreach ($email in $testEmails) {
        $userTickets = $response.object | Where-Object { $_.customerEmail -eq $email }
        Write-Host "  📧 $email : $($userTickets.Count) tickets" -ForegroundColor White
    }
} catch {
    Write-Host "❌ /api/tickets/test - Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test profile API
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/user/profile" -Method GET
    Write-Host "✅ /api/user/profile - Working" -ForegroundColor Green
    Write-Host "  User email: $($response.object.email)" -ForegroundColor White
} catch {
    Write-Host "❌ /api/user/profile - Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  This might be due to missing authentication" -ForegroundColor Yellow
}

Write-Host "`n2. Expected Behavior After Fix:" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "✅ Page should automatically load bookings on first visit" -ForegroundColor Green
Write-Host "✅ No need to click 'Làm mới' button" -ForegroundColor Green
Write-Host "✅ Bookings should appear immediately" -ForegroundColor Green
Write-Host "✅ Console should show debug logs" -ForegroundColor Green

Write-Host "`n3. Debug Steps:" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host "1. Open browser and go to http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12) → Console tab" -ForegroundColor White
Write-Host "3. Look for these log messages:" -ForegroundColor White
Write-Host "   - '🎯 [Profile] Starting fetchUserData...'" -ForegroundColor Gray
Write-Host "   - '🎯 [Profile] Using email: [email]'" -ForegroundColor Gray
Write-Host "   - '🎯 [Profile] Initial load - trying test API...'" -ForegroundColor Gray
Write-Host "   - '🎯 [Profile] Filtered user bookings: [array]'" -ForegroundColor Gray

Write-Host "`n4. If Still Not Working:" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host "Check these potential issues:" -ForegroundColor White
Write-Host "• User not logged in (no authUser)" -ForegroundColor White
Write-Host "• Email mismatch between authUser and booking data" -ForegroundColor White
Write-Host "• API endpoint not responding" -ForegroundColor White
Write-Host "• JavaScript errors in console" -ForegroundColor White

Write-Host "`n5. Manual Test:" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Write-Host "If auto-load still doesn't work, try:" -ForegroundColor White
Write-Host "• Click 'Làm mới' button to test manual refresh" -ForegroundColor White
Write-Host "• Check if bookings appear after manual refresh" -ForegroundColor White
Write-Host "• This confirms the API is working, just auto-load needs fixing" -ForegroundColor White
