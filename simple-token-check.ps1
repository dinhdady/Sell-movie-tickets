# Simple script to check ticket tokens
Write-Host "Checking ticket tokens..." -ForegroundColor Green

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
        
        Write-Host "`nOrder info:" -ForegroundColor Yellow
        if ($ticket.order) {
            Write-Host "Order ID: $($ticket.order.id)" -ForegroundColor White
            Write-Host "Tickets count: $($ticket.order.tickets.Count)" -ForegroundColor White
            if ($ticket.order.tickets.Count -gt 0) {
                $firstTicket = $ticket.order.tickets[0]
                Write-Host "First ticket token: $($firstTicket.token)" -ForegroundColor White
                Write-Host "Token type: $($firstTicket.token.GetType())" -ForegroundColor White
            }
        }
        
        # Check root level
        if ($ticket.token) {
            Write-Host "Root token: $($ticket.token)" -ForegroundColor White
        } else {
            Write-Host "No root token" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
