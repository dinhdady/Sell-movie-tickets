# Final test for Profile booking details
Write-Host "🎬 Final Profile Booking Details Test" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`nTesting Profile page booking details functionality..." -ForegroundColor Green

# Quick API test
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "✅ API Status: Working ($($response.object.Count) tickets)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Status: Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Check if booking history loads automatically" -ForegroundColor White
Write-Host "3. Click on any booking to view details" -ForegroundColor White
Write-Host "4. Verify all details are displayed" -ForegroundColor White

Write-Host "`nExpected Results in Booking Detail Modal:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Movie: Title, poster, duration" -ForegroundColor Green
Write-Host "✅ Showtime: Date, time, room" -ForegroundColor Green
Write-Host "✅ Cinema: Name, address, phone" -ForegroundColor Green
Write-Host "✅ Seats: Seat number, type, price" -ForegroundColor Green
Write-Host "✅ QR Code: Generated QR code image" -ForegroundColor Green
Write-Host "✅ Customer: Name, email, phone, address" -ForegroundColor Green
Write-Host "✅ Total: Price calculation" -ForegroundColor Green
Write-Host "✅ Status: Payment status" -ForegroundColor Green

Write-Host "`nMock Data Features:" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta
Write-Host "• QR Code: Auto-generated if missing" -ForegroundColor White
Write-Host "• Seat: Default A1 if not available" -ForegroundColor White
Write-Host "• Phone/Address: 'Chưa cập nhật' if missing" -ForegroundColor White
Write-Host "• Token: Generated ticket token" -ForegroundColor White

Write-Host "`nIf Issues:" -ForegroundColor Red
Write-Host "==========" -ForegroundColor Red
Write-Host "• Check console logs for errors" -ForegroundColor White
Write-Host "• Verify API is working" -ForegroundColor White
Write-Host "• Check if booking data is loaded" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
