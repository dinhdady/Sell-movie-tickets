# Final test for correct tickets API usage and sorting
Write-Host "🎬 Final Tickets API Test" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "`nTesting correct tickets API usage and sorting..." -ForegroundColor Green

# Check tickets API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ Tickets API Status: Working" -ForegroundColor Green
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        Write-Host "✅ Real tickets available in database" -ForegroundColor Green
        $ticket = $response.object[0]
        Write-Host "Sample token: $($ticket.token)" -ForegroundColor White
        Write-Host "Sample customer: $($ticket.order.customerEmail)" -ForegroundColor White
        Write-Host "Sample movie: $($ticket.movieTitle)" -ForegroundColor White
        Write-Host "Sample price: $($ticket.price)đ" -ForegroundColor White
    } else {
        Write-Host "⚠️ No tickets in database yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Tickets API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Check console logs for:" -ForegroundColor White
Write-Host "   🎯 [Profile] Trying tickets with tokens API..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Found bookings with real tokens: X" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Sample booking with token: [object]" -ForegroundColor Gray
Write-Host "3. Verify bookings are sorted by newest first" -ForegroundColor White
Write-Host "4. Click on any booking to see real token" -ForegroundColor White

Write-Host "`nExpected API Priority:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "1. /api/test/tickets-with-tokens (Primary - with real tokens)" -ForegroundColor Green
Write-Host "2. /api/test/tickets (Secondary - test tickets)" -ForegroundColor Yellow
Write-Host "3. /api/test/bookings (Tertiary - fallback)" -ForegroundColor Yellow

Write-Host "`nExpected Sorting:" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta
Write-Host "✅ Sort by createdAt descending (newest first)" -ForegroundColor Green
Write-Host "✅ Most recent booking appears at top" -ForegroundColor Green
Write-Host "✅ Oldest booking appears at bottom" -ForegroundColor Green

Write-Host "`nExpected Data Structure:" -ForegroundColor Blue
Write-Host "=======================" -ForegroundColor Blue
Write-Host "Each booking should have:" -ForegroundColor White
Write-Host "• Real token from database (UUID format)" -ForegroundColor White
Write-Host "• Complete movie information" -ForegroundColor White
Write-Host "• Complete showtime information" -ForegroundColor White
Write-Host "• Complete seat information" -ForegroundColor White
Write-Host "• Complete order information" -ForegroundColor White
Write-Host "• QR code with real token" -ForegroundColor White

Write-Host "`nConsole Logs to Check:" -ForegroundColor Red
Write-Host "=====================" -ForegroundColor Red
Write-Host "Look for these logs in browser console:" -ForegroundColor White
Write-Host "🎯 [Profile] Trying tickets with tokens API..." -ForegroundColor Gray
Write-Host "🎯 [Profile] Tokens API response: [array]" -ForegroundColor Gray
Write-Host "🎯 [Profile] Found bookings with real tokens: X" -ForegroundColor Gray
Write-Host "🎯 [Profile] Sample booking with token: [object]" -ForegroundColor Gray

Write-Host "`nReady to test!" -ForegroundColor Cyan
