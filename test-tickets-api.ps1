# Test Tickets API Script
Write-Host "Testing Tickets API..." -ForegroundColor Green

# Check if backend is running
Write-Host "Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/testing/hello" -Method GET -UseBasicParsing
    Write-Host "Backend is running" -ForegroundColor Green
} catch {
    Write-Host "Backend is not running. Starting it..." -ForegroundColor Red
    Start-Process -FilePath "java" -ArgumentList "-jar", "target/movie-0.0.1-SNAPSHOT.jar" -WindowStyle Hidden
    Start-Sleep -Seconds 15
}

# Test tickets test endpoint
Write-Host "Testing tickets test endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "Tickets test endpoint response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
        if ($response.object.Count -gt 0) {
            Write-Host "First ticket sample:" -ForegroundColor White
            $firstTicket = $response.object[0]
            Write-Host "  - ID: $($firstTicket.id)" -ForegroundColor Gray
            Write-Host "  - Customer: $($firstTicket.customerName)" -ForegroundColor Gray
            Write-Host "  - Movie: $($firstTicket.movie.title)" -ForegroundColor Gray
            Write-Host "  - Total Price: $($firstTicket.totalPrice)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Tickets test endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test with token
$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW5oMTIzMyIsInJvbGUiOiJST0xFX0FETUlOIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6Im1vdmllIiwiaWF0IjoxNzU4NTIwNTg4LCJleHAiOjE3NTg1MjQxODh9.aHJw3rZ1PBYp4QIBVyZxoPPv22A1WsS-rFttDb_9EmM"

Write-Host "Testing tickets API with token..." -ForegroundColor Cyan
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets" -Method GET -Headers $headers
    Write-Host "Tickets API response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "Tickets API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user tickets
Write-Host "Testing user tickets API..." -ForegroundColor Cyan
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/my-tickets?userId=dinh1233" -Method GET -Headers $headers
    Write-Host "User tickets API response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "User tickets count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "User tickets API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Tickets API Test Complete!" -ForegroundColor Green
Write-Host "You can now access:" -ForegroundColor Cyan
Write-Host "  - Admin page: http://localhost:5173/admin/bookings" -ForegroundColor White
Write-Host "  - Profile page: http://localhost:5173/profile" -ForegroundColor White
Write-Host "Both pages now use tickets data instead of booking data." -ForegroundColor Yellow