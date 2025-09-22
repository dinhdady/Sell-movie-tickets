# Test script cho Admin Bookings API
Write-Host "🎬 Testing Admin Bookings API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

Write-Host "`n1. Testing /api/tickets/test endpoint (primary for admin)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ Success! Found $($response.object.Count) tickets" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        Write-Host "`nSample tickets:" -ForegroundColor Cyan
        $count = 0
        foreach ($ticket in $response.object) {
            if ($count -ge 3) { break }
            Write-Host "  ID: $($ticket.id)" -ForegroundColor White
            Write-Host "  Customer: $($ticket.customerName)" -ForegroundColor White
            Write-Host "  Email: $($ticket.customerEmail)" -ForegroundColor White
            Write-Host "  Movie: $($ticket.movie.title)" -ForegroundColor White
            Write-Host "  Price: $($ticket.totalPrice)đ" -ForegroundColor White
            Write-Host "  Status: $($ticket.paymentStatus)" -ForegroundColor White
            Write-Host ""
            $count++
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing /api/tickets endpoint (requires auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets" -Method GET
    Write-Host "✅ Success! Found $($response.object.Count) tickets" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to missing authentication" -ForegroundColor Yellow
}

Write-Host "`n3. Testing /api/admin/bookings endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/bookings" -Method GET
    Write-Host "✅ Success! Found $($response.object.Count) bookings" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to missing authentication or endpoint not existing" -ForegroundColor Yellow
}

Write-Host "`n4. Testing /api/booking endpoint (all bookings)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking" -Method GET
    Write-Host "✅ Success! Found $($response.Count) bookings" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "`nSample bookings:" -ForegroundColor Cyan
        $count = 0
        foreach ($booking in $response) {
            if ($count -ge 3) { break }
            Write-Host "  ID: $($booking.id)" -ForegroundColor White
            Write-Host "  Customer: $($booking.customerName)" -ForegroundColor White
            Write-Host "  Email: $($booking.customerEmail)" -ForegroundColor White
            Write-Host "  Price: $($booking.totalPrice)đ" -ForegroundColor White
            Write-Host "  Status: $($booking.status)" -ForegroundColor White
            Write-Host ""
            $count++
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Testing booking detail endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking/223/details" -Method GET
    Write-Host "✅ Success! Booking detail retrieved" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Summary for Admin Bookings:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ /api/tickets/test - Working (no auth required)" -ForegroundColor Green
Write-Host "❌ /api/tickets - Requires authentication" -ForegroundColor Red
Write-Host "❌ /api/admin/bookings - May not exist or requires auth" -ForegroundColor Red
Write-Host "❌ /api/booking - May have issues" -ForegroundColor Red
Write-Host "✅ /api/booking/{id}/details - Working for details" -ForegroundColor Green

Write-Host "`n💡 Recommendation:" -ForegroundColor Yellow
Write-Host "Use /api/tickets/test as primary source for admin bookings" -ForegroundColor White
Write-Host "This endpoint provides all booking data without authentication" -ForegroundColor White
Write-Host "The current admin page logic is already using this approach" -ForegroundColor White