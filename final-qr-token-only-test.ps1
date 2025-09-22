# Final test for QR code with token only
Write-Host "🎬 Final QR Token Only Test" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

Write-Host "`nTesting QR code contains only token from database..." -ForegroundColor Green

# Check if tickets exist
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ API Status: Working" -ForegroundColor Green
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        Write-Host "✅ Real tokens available" -ForegroundColor Green
        $ticket = $response.object[0]
        Write-Host "Sample token: $($ticket.token)" -ForegroundColor White
    } else {
        Write-Host "⚠️ No tickets in database yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Click on any booking to view details" -ForegroundColor White
Write-Host "3. Check QR code in the modal" -ForegroundColor White
Write-Host "4. Verify QR code contains only token" -ForegroundColor White

Write-Host "`nExpected Results:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ QR code displays in modal" -ForegroundColor Green
Write-Host "✅ QR code contains ONLY token (no JSON)" -ForegroundColor Green
Write-Host "✅ Token is from database (UUID format)" -ForegroundColor Green
Write-Host "✅ QR code is scannable" -ForegroundColor Green
Write-Host "✅ Token matches displayed token" -ForegroundColor Green

Write-Host "`nQR Code Content:" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Write-Host "The QR code should contain ONLY:" -ForegroundColor White
Write-Host "• Token from database (e.g., d1ec0b24-782c-4101-bb35-5bccb286469b)" -ForegroundColor White
Write-Host "• No JSON data" -ForegroundColor White
Write-Host "• No booking information" -ForegroundColor White
Write-Host "• No customer information" -ForegroundColor White

Write-Host "`nBenefits of Token-Only QR:" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host "• Simpler and cleaner" -ForegroundColor White
Write-Host "• Faster scanning" -ForegroundColor White
Write-Host "• Smaller QR code size" -ForegroundColor White
Write-Host "• Easy to read and verify" -ForegroundColor White
Write-Host "• Direct token lookup in database" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
