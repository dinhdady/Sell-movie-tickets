# Test new tokens endpoint
Write-Host "Testing /api/test/tickets-with-tokens endpoint..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nFirst ticket with token:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)" -ForegroundColor White
        Write-Host "Status: $($ticket.status)" -ForegroundColor White
        Write-Host "QR Code URL: $($ticket.qrCodeUrl)" -ForegroundColor White
        Write-Host "Used: $($ticket.used)" -ForegroundColor White
        
        if ($ticket.seat) {
            Write-Host "`nSeat info:" -ForegroundColor Cyan
            Write-Host "Seat Number: $($ticket.seat.seatNumber)" -ForegroundColor White
            Write-Host "Seat Type: $($ticket.seat.seatType)" -ForegroundColor White
            Write-Host "Row: $($ticket.seat.rowNumber)" -ForegroundColor White
            Write-Host "Column: $($ticket.seat.columnNumber)" -ForegroundColor White
        }
        
        if ($ticket.order) {
            Write-Host "`nOrder info:" -ForegroundColor Cyan
            Write-Host "Order ID: $($ticket.order.id)" -ForegroundColor White
            Write-Host "Customer Email: $($ticket.order.customerEmail)" -ForegroundColor White
            Write-Host "Total Price: $($ticket.order.totalPrice)" -ForegroundColor White
            Write-Host "Order Status: $($ticket.order.status)" -ForegroundColor White
        }
    } else {
        Write-Host "No tickets found in database" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
