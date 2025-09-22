# Final test for Admin Bookings
Write-Host "🎬 Final Admin Bookings Test" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

Write-Host "`nTesting admin bookings functionality..." -ForegroundColor Green

# Quick API test
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "✅ API Status: Working ($($response.object.Count) tickets)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Status: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/admin/bookings" -ForegroundColor White
Write-Host "2. Check if page loads automatically" -ForegroundColor White
Write-Host "3. Verify 24 tickets are displayed" -ForegroundColor White
Write-Host "4. Test search functionality" -ForegroundColor White
Write-Host "5. Test filter by status" -ForegroundColor White
Write-Host "6. Click 'Test API' button for debugging" -ForegroundColor White

Write-Host "`nExpected Results:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ Page loads with 24 tickets" -ForegroundColor Green
Write-Host "✅ Search works (try 'Hoang Dinh')" -ForegroundColor Green
Write-Host "✅ Filter works (try 'PAID')" -ForegroundColor Green
Write-Host "✅ Pagination works (30 per page)" -ForegroundColor Green
Write-Host "✅ Click on booking to see details" -ForegroundColor Green

Write-Host "`nIf Issues:" -ForegroundColor Red
Write-Host "==========" -ForegroundColor Red
Write-Host "• Check console logs for errors" -ForegroundColor White
Write-Host "• Click 'Test API' button" -ForegroundColor White
Write-Host "• Check network requests" -ForegroundColor White
Write-Host "• Verify backend is running" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan

