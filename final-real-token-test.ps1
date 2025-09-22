# Final test for real token integration
Write-Host "🎬 Final Real Token Integration Test" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`nTesting real token integration..." -ForegroundColor Green

# Check if tickets exist
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ API Status: Working" -ForegroundColor Green
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        Write-Host "✅ Real tokens available in database" -ForegroundColor Green
        $ticket = $response.object[0]
        Write-Host "Sample token: $($ticket.token)" -ForegroundColor White
    } else {
        Write-Host "⚠️ No tickets in database yet" -ForegroundColor Yellow
        Write-Host "This is normal if no bookings have been made" -ForegroundColor White
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Check console logs for:" -ForegroundColor White
Write-Host "   🎯 [Profile] Trying tickets with tokens API..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Found bookings with real tokens: X" -ForegroundColor Gray
Write-Host "3. Click on any booking to view details" -ForegroundColor White
Write-Host "4. Verify QR code contains real token" -ForegroundColor White

Write-Host "`nExpected Behavior:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "✅ If tickets exist: Use real token from database" -ForegroundColor Green
Write-Host "✅ If no tickets: Fallback to test API" -ForegroundColor Green
Write-Host "✅ QR code shows real token (UUID format)" -ForegroundColor Green
Write-Host "✅ No mock/generated tokens" -ForegroundColor Green

Write-Host "`nToken Priority:" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Write-Host "1. Real token from /api/test/tickets-with-tokens" -ForegroundColor White
Write-Host "2. Fallback to test API if no real tokens" -ForegroundColor White
Write-Host "3. Generate TKT{id} as last resort" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
