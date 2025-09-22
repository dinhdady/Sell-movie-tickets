# Simple test for real token from API
Write-Host "Testing real token from API..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "API Status: $($response.state)" -ForegroundColor White
    Write-Host "Count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nFirst ticket:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)" -ForegroundColor White
        Write-Host "Status: $($ticket.status)" -ForegroundColor White
        
        if ($ticket.seat) {
            Write-Host "Seat: $($ticket.seat.seatNumber)" -ForegroundColor White
        }
        
        if ($ticket.order) {
            Write-Host "Customer: $($ticket.order.customerEmail)" -ForegroundColor White
        }
    } else {
        Write-Host "No tickets found" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Check console logs" -ForegroundColor White
Write-Host "3. Click on booking to see real token" -ForegroundColor White
