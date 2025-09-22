# Test script for ticket information display
Write-Host "🎬 Testing Ticket Information Display" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`nTesting ticket information display in Profile page..." -ForegroundColor Green

# Check tickets API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ Tickets API Status: Working" -ForegroundColor Green
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nSample ticket information:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)đ" -ForegroundColor White
        Write-Host "Status: $($ticket.status)" -ForegroundColor White
        Write-Host "Used: $($ticket.used)" -ForegroundColor White
        Write-Host "Created: $($ticket.createdAt)" -ForegroundColor White
        
        if ($ticket.seat) {
            Write-Host "`nSeat information:" -ForegroundColor Cyan
            Write-Host "Seat Number: $($ticket.seat.seatNumber)" -ForegroundColor White
            Write-Host "Seat Type: $($ticket.seat.seatType)" -ForegroundColor White
            Write-Host "Row: $($ticket.seat.rowNumber)" -ForegroundColor White
            Write-Host "Column: $($ticket.seat.columnNumber)" -ForegroundColor White
        }
        
        if ($ticket.order) {
            Write-Host "`nOrder information:" -ForegroundColor Cyan
            Write-Host "Order ID: $($ticket.order.id)" -ForegroundColor White
            Write-Host "Customer: $($ticket.order.customerEmail)" -ForegroundColor White
            Write-Host "Total: $($ticket.order.totalPrice)đ" -ForegroundColor White
        }
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
Write-Host "3. Check ticket information section" -ForegroundColor White
Write-Host "4. Verify all ticket details are displayed" -ForegroundColor White

Write-Host "`nExpected Ticket Information:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "✅ Seat number and type" -ForegroundColor Green
Write-Host "✅ Ticket status (PENDING/PAID/USED)" -ForegroundColor Green
Write-Host "✅ Token (UUID format)" -ForegroundColor Green
Write-Host "✅ Price" -ForegroundColor Green
Write-Host "✅ Usage status (isUsed)" -ForegroundColor Green
Write-Host "✅ Created date" -ForegroundColor Green
Write-Host "✅ Status color coding" -ForegroundColor Green

Write-Host "`nTicketStatus Mapping:" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta
Write-Host "PENDING → Chờ thanh toán (Yellow)" -ForegroundColor White
Write-Host "PAID → Đã thanh toán (Green)" -ForegroundColor White
Write-Host "USED → Đã sử dụng (Blue)" -ForegroundColor White

Write-Host "`nTicket Model Fields:" -ForegroundColor Blue
Write-Host "====================" -ForegroundColor Blue
Write-Host "• id: Ticket ID" -ForegroundColor White
Write-Host "• token: UUID token" -ForegroundColor White
Write-Host "• price: Ticket price" -ForegroundColor White
Write-Host "• isUsed: Usage status" -ForegroundColor White
Write-Host "• status: TicketStatus enum" -ForegroundColor White
Write-Host "• qrCodeUrl: QR code URL" -ForegroundColor White
Write-Host "• createdAt: Creation date" -ForegroundColor White
Write-Host "• seat: Seat information" -ForegroundColor White
Write-Host "• order: Order information" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
