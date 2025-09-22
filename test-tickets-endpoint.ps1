# Test tickets endpoint for tokens
Write-Host "Testing /api/test/tickets endpoint..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets" -Method GET
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nFirst ticket:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)" -ForegroundColor White
        Write-Host "Status: $($ticket.status)" -ForegroundColor White
        Write-Host "Seat: $($ticket.seatNumber)" -ForegroundColor White
        Write-Host "Movie: $($ticket.movieTitle)" -ForegroundColor White
        Write-Host "Customer: $($ticket.customerEmail)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
