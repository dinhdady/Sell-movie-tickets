# Simple Tickets API Test
Write-Host "Testing Tickets API..." -ForegroundColor Green

# Test tickets test endpoint
Write-Host "Testing tickets test endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "Tickets test response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "Tickets test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test complete!" -ForegroundColor Green

