# Simple test script for tickets API
$baseUrl = "http://localhost:8080/api"
$testUserId = "1"

Write-Host "Testing tickets API..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$testUserId" -Method GET
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
