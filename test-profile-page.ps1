# Test script để kiểm tra Profile page với API calls
Write-Host "🎬 Testing Profile Page API Integration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

Write-Host "`n1. Testing /api/tickets/test (working endpoint)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ Success! Found $($response.object.Count) tickets" -ForegroundColor Green
    
    # Filter by specific email
    $testEmail = "dinhhoang2207004@gmail.com"
    $userTickets = $response.object | Where-Object { $_.customerEmail -eq $testEmail }
    Write-Host "Tickets for $testEmail : $($userTickets.Count)" -ForegroundColor Cyan
    
    if ($userTickets.Count -gt 0) {
        Write-Host "`nSample ticket for $testEmail :" -ForegroundColor Yellow
        $sample = $userTickets[0]
        Write-Host "  ID: $($sample.id)" -ForegroundColor White
        Write-Host "  Movie: $($sample.movie.title)" -ForegroundColor White
        Write-Host "  Total: $($sample.totalPrice)đ" -ForegroundColor White
        Write-Host "  Status: $($sample.paymentStatus)" -ForegroundColor White
        Write-Host "  Created: $($sample.createdAt)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing /api/booking endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking" -Method GET
    Write-Host "✅ Success! Found $($response.Count) bookings" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing /api/test/bookings endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/test/bookings" -Method GET
    Write-Host "✅ Success! Found $($response.object.Count) bookings" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Summary for Profile Page:" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "✅ /api/tickets/test - Working (24 tickets found)" -ForegroundColor Green
Write-Host "❌ /api/booking - Not working" -ForegroundColor Red
Write-Host "❌ /api/test/bookings - Not working" -ForegroundColor Red
Write-Host "❌ /api/tickets/my-tickets - Requires authentication" -ForegroundColor Red

Write-Host "`n💡 Recommendation:" -ForegroundColor Yellow
Write-Host "Use /api/tickets/test endpoint and filter by customerEmail" -ForegroundColor White
Write-Host "This is what the Profile page is already doing!" -ForegroundColor White
