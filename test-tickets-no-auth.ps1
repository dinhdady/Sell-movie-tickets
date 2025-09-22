# Test tickets API without authentication
$baseUrl = "http://localhost:8080/api"

Write-Host "Testing tickets API endpoints..." -ForegroundColor Green

# Test 1: Test endpoint (no auth required)
Write-Host "`n1. Testing /api/tickets/test..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "Success! Found $($response.object.Count) tickets" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $firstTicket = $response.object[0]
        Write-Host "First ticket:" -ForegroundColor Yellow
        Write-Host "  ID: $($firstTicket.id)" -ForegroundColor White
        Write-Host "  Customer: $($firstTicket.customerName)" -ForegroundColor White
        Write-Host "  Email: $($firstTicket.customerEmail)" -ForegroundColor White
        Write-Host "  Total: $($firstTicket.totalPrice)đ" -ForegroundColor White
        Write-Host "  Status: $($firstTicket.status)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: All bookings endpoint
Write-Host "`n2. Testing /api/booking..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking" -Method GET
    Write-Host "Success! Found $($response.Count) bookings" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        $firstBooking = $response[0]
        Write-Host "First booking:" -ForegroundColor Yellow
        Write-Host "  ID: $($firstBooking.id)" -ForegroundColor White
        Write-Host "  Customer: $($firstBooking.customerName)" -ForegroundColor White
        Write-Host "  Email: $($firstBooking.customerEmail)" -ForegroundColor White
        Write-Host "  Total: $($firstBooking.totalPrice)đ" -ForegroundColor White
        Write-Host "  Status: $($firstBooking.status)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
