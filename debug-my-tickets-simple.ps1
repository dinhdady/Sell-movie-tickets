# Simple debug script for my-tickets API
Write-Host "Debug My Tickets API Response" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$userId = "1"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$userId" -Method GET
    
    Write-Host "API Status: $($response.state)" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Data count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nSample ticket properties:" -ForegroundColor Yellow
        
        Write-Host "id: $($ticket.id)" -ForegroundColor White
        Write-Host "status: $($ticket.status)" -ForegroundColor White
        Write-Host "token: $($ticket.token)" -ForegroundColor White
        Write-Host "price: $($ticket.price)" -ForegroundColor White
        Write-Host "customerEmail: $($ticket.customerEmail)" -ForegroundColor White
        Write-Host "movieTitle: $($ticket.movieTitle)" -ForegroundColor White
        Write-Host "seatNumber: $($ticket.seatNumber)" -ForegroundColor White
        Write-Host "createdAt: $($ticket.createdAt)" -ForegroundColor White
        
        # Check all properties
        Write-Host "`nAll properties:" -ForegroundColor Cyan
        $ticket.PSObject.Properties | ForEach-Object {
            $value = if ($_.Value -eq $null) { "NULL" } else { $_.Value }
            Write-Host "$($_.Name): $value" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
