# Test script for new Profile page approach
Write-Host "🎬 Testing New Profile Page Approach" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`nNew approach features:" -ForegroundColor Yellow
Write-Host "• Separate useEffects for profile and bookings" -ForegroundColor White
Write-Host "• Force load bookings on component mount" -ForegroundColor White
Write-Host "• Multiple fallback strategies" -ForegroundColor White
Write-Host "• Better error handling" -ForegroundColor White

Write-Host "`n1. API Test:" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "✅ API working - $($response.object.Count) tickets" -ForegroundColor Green
    
    # Show sample data
    if ($response.object.Count -gt 0) {
        $sample = $response.object[0]
        Write-Host "Sample ticket:" -ForegroundColor Cyan
        Write-Host "  ID: $($sample.id)" -ForegroundColor White
        Write-Host "  Email: $($sample.customerEmail)" -ForegroundColor White
        Write-Host "  Movie: $($sample.movie.title)" -ForegroundColor White
        Write-Host "  Price: $($sample.totalPrice)đ" -ForegroundColor White
    }
} catch {
    Write-Host "❌ API error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Instructions:" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12) → Console" -ForegroundColor White
Write-Host "3. Look for these logs in order:" -ForegroundColor White
Write-Host "   🎯 [Profile] Loading user profile..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Force loading bookings on mount..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Force load - API response: [array]" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Force load - filtered bookings: X" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Rendering bookings section, bookings.length: X" -ForegroundColor Gray

Write-Host "`n3. Expected Behavior:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "✅ Bookings should load automatically within 500ms" -ForegroundColor Green
Write-Host "✅ No need to click 'Làm mới'" -ForegroundColor Green
Write-Host "✅ Console should show multiple loading attempts" -ForegroundColor Green
Write-Host "✅ If user logged in: shows filtered bookings" -ForegroundColor Green
Write-Host "✅ If user not logged in: shows all bookings" -ForegroundColor Green

Write-Host "`n4. Debug Information:" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta
Write-Host "The new approach uses:" -ForegroundColor White
Write-Host "• useEffect with empty deps [] - runs on mount" -ForegroundColor White
Write-Host "• setTimeout 500ms delay - ensures everything loaded" -ForegroundColor White
Write-Host "• Multiple loading strategies - increases success rate" -ForegroundColor White
Write-Host "• Better logging - easier to debug" -ForegroundColor White

Write-Host "`n5. If Still Not Working:" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host "Check console for:" -ForegroundColor White
Write-Host "• JavaScript errors" -ForegroundColor White
Write-Host "• Network request failures" -ForegroundColor White
Write-Host "• Authentication issues" -ForegroundColor White
Write-Host "• API response format" -ForegroundColor White

Write-Host "`nReady to test the new approach!" -ForegroundColor Cyan
