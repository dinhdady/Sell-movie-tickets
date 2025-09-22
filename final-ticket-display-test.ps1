# Final test for ticket information display
Write-Host "🎬 Final Ticket Display Test" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

Write-Host "`nTesting complete ticket information display..." -ForegroundColor Green

# Check API status
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ API Status: Working" -ForegroundColor Green
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Click on any booking to view details" -ForegroundColor White
Write-Host "3. Check 'Thông tin vé đã đặt' section" -ForegroundColor White
Write-Host "4. Verify all ticket details are shown" -ForegroundColor White

Write-Host "`nExpected Display Features:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "✅ Ticket cards with seat information" -ForegroundColor Green
Write-Host "✅ Status badges (PENDING/PAID/USED)" -ForegroundColor Green
Write-Host "✅ Token display with monospace font" -ForegroundColor Green
Write-Host "✅ Price information" -ForegroundColor Green
Write-Host "✅ Usage status (isUsed)" -ForegroundColor Green
Write-Host "✅ Created date" -ForegroundColor Green
Write-Host "✅ Color-coded status indicators" -ForegroundColor Green
Write-Host "✅ TicketStatus legend" -ForegroundColor Green

Write-Host "`nTicket Information Layout:" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta
Write-Host "Each ticket shows:" -ForegroundColor White
Write-Host "• Seat number (large, blue background)" -ForegroundColor White
Write-Host "• Seat type (VIP/Ghế đôi/Ghế thường)" -ForegroundColor White
Write-Host "• Status badge (PENDING/PAID/USED)" -ForegroundColor White
Write-Host "• Token (monospace, copyable)" -ForegroundColor White
Write-Host "• Price (green, bold)" -ForegroundColor White
Write-Host "• Usage status (Đã sử dụng/Chưa sử dụng)" -ForegroundColor White
Write-Host "• Created date" -ForegroundColor White

Write-Host "`nStatus Color Coding:" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue
Write-Host "PENDING: Yellow background" -ForegroundColor White
Write-Host "PAID: Green background" -ForegroundColor White
Write-Host "USED: Blue background" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
