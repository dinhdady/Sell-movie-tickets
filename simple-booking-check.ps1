# Simple script to check booking details
Write-Host "Checking booking details..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "API Status: $($response.state)" -ForegroundColor White
    Write-Host "Total tickets: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nSample ticket:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Customer: $($ticket.customerName)" -ForegroundColor White
        Write-Host "Email: $($ticket.customerEmail)" -ForegroundColor White
        Write-Host "Phone: $($ticket.customerPhone)" -ForegroundColor White
        Write-Host "Address: $($ticket.customerAddress)" -ForegroundColor White
        
        Write-Host "`nOrder info:" -ForegroundColor Yellow
        if ($ticket.order) {
            Write-Host "Order exists: Yes" -ForegroundColor Green
            Write-Host "Tickets count: $($ticket.order.tickets.Count)" -ForegroundColor White
            if ($ticket.order.tickets.Count -gt 0) {
                $firstTicket = $ticket.order.tickets[0]
                Write-Host "First ticket seat: $($firstTicket.seat.seatNumber)" -ForegroundColor White
                Write-Host "QR Code URL: $($firstTicket.qrCodeUrl)" -ForegroundColor White
            }
        } else {
            Write-Host "Order exists: No" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
