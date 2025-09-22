# Final test for QR code with real token
Write-Host "🎬 Final QR Code Token Test" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

Write-Host "`nTesting QR code with real token functionality..." -ForegroundColor Green

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
Write-Host "2. Click on any booking to view details" -ForegroundColor White
Write-Host "3. Check QR code in the modal" -ForegroundColor White
Write-Host "4. Verify QR code contains real token data" -ForegroundColor White

Write-Host "`nExpected QR Code Features:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "✅ QR code displays in modal" -ForegroundColor Green
Write-Host "✅ QR code contains JSON data" -ForegroundColor Green
Write-Host "✅ Token format: TKT{id}_{user}_{timestamp}" -ForegroundColor Green
Write-Host "✅ All booking info included" -ForegroundColor Green
Write-Host "✅ QR code is scannable" -ForegroundColor Green

Write-Host "`nQR Code Content:" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Write-Host "The QR code should contain:" -ForegroundColor White
Write-Host "• bookingId: Real booking ID" -ForegroundColor White
Write-Host "• token: Generated or real token" -ForegroundColor White
Write-Host "• customerEmail: Customer email" -ForegroundColor White
Write-Host "• movieTitle: Movie title" -ForegroundColor White
Write-Host "• showtime: Showtime date" -ForegroundColor White
Write-Host "• totalPrice: Total price" -ForegroundColor White
Write-Host "• status: Payment status" -ForegroundColor White

Write-Host "`nIf Issues:" -ForegroundColor Red
Write-Host "==========" -ForegroundColor Red
Write-Host "• Check console logs for errors" -ForegroundColor White
Write-Host "• Verify QR code is generated" -ForegroundColor White
Write-Host "• Check if token is correct" -ForegroundColor White
Write-Host "• Verify JSON data is valid" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
