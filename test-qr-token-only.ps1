# Test script for QR code with token only
Write-Host "🎬 Testing QR Code with Token Only" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`nTesting QR code contains only token..." -ForegroundColor Green

# Check tickets API for real tokens
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ Tickets API Status: Working" -ForegroundColor Green
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nSample ticket with real token:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Customer: $($ticket.order.customerEmail)" -ForegroundColor White
        Write-Host "Movie: $($ticket.movieTitle)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)đ" -ForegroundColor White
        
        Write-Host "`nQR Code should contain ONLY:" -ForegroundColor Cyan
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "No JSON data, no other information" -ForegroundColor White
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
Write-Host "2. Click on any booking to view details" -ForegroundColor White
Write-Host "3. Check QR code in the modal" -ForegroundColor White
Write-Host "4. Scan QR code to verify it contains only token" -ForegroundColor White

Write-Host "`nExpected QR Code Content:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "✅ QR code contains ONLY the token" -ForegroundColor Green
Write-Host "✅ Token format: UUID (d1ec0b24-782c-4101-bb35-5bccb286469b)" -ForegroundColor Green
Write-Host "✅ No JSON data" -ForegroundColor Green
Write-Host "✅ No booking information" -ForegroundColor Green
Write-Host "✅ No customer information" -ForegroundColor Green
Write-Host "✅ No movie information" -ForegroundColor Green

Write-Host "`nQR Code Examples:" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta
Write-Host "Before (JSON):" -ForegroundColor White
Write-Host "{\"bookingId\":223,\"token\":\"d1ec0b24-782c-4101-bb35-5bccb286469b\",...}" -ForegroundColor Gray
Write-Host "`nAfter (Token only):" -ForegroundColor White
Write-Host "d1ec0b24-782c-4101-bb35-5bccb286469b" -ForegroundColor Green

Write-Host "`nBenefits:" -ForegroundColor Blue
Write-Host "=========" -ForegroundColor Blue
Write-Host "• Simpler QR code" -ForegroundColor White
Write-Host "• Faster scanning" -ForegroundColor White
Write-Host "• Smaller QR code size" -ForegroundColor White
Write-Host "• Easy to read token" -ForegroundColor White
Write-Host "• Direct token lookup" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
