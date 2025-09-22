# Test Tickets API with Token
Write-Host "Testing Tickets API with Token..." -ForegroundColor Green

$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW5oMTIzMyIsInJvbGUiOiJST0xFX0FETUlOIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6Im1vdmllIiwiaWF0IjoxNzU4NTIwNTg4LCJleHAiOjE3NTg1MjQxODh9.aHJw3rZ1PBYp4QIBVyZxoPPv22A1WsS-rFttDb_9EmM"

# Test admin tickets
Write-Host "Testing admin tickets..." -ForegroundColor Cyan
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets" -Method GET -Headers $headers
    Write-Host "Admin tickets response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Admin tickets count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "Admin tickets failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user tickets
Write-Host "Testing user tickets..." -ForegroundColor Cyan
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/my-tickets?userId=dinh1233" -Method GET -Headers $headers
    Write-Host "User tickets response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "User tickets count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "User tickets failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test complete!" -ForegroundColor Green

