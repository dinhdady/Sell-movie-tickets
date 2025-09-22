# Test script để lấy vé đã đặt của user
# Script này sẽ test các API endpoints để lấy vé đã đặt

Write-Host "🎬 Testing User Tickets API Endpoints" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Base URL
$baseUrl = "http://localhost:8080/api"

# Test user ID (thay đổi theo user thực tế)
$testUserId = "1"

Write-Host "`n1. Testing /api/tickets/test endpoint (no auth required)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET -ContentType "application/json"
    Write-Host "✅ Test tickets endpoint response:" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object -and $response.object.Count -gt 0) {
        Write-Host "`nFirst ticket details:" -ForegroundColor Cyan
        $firstTicket = $response.object[0]
        Write-Host "  - ID: $($firstTicket.id)" -ForegroundColor White
        Write-Host "  - Customer: $($firstTicket.customerName)" -ForegroundColor White
        Write-Host "  - Email: $($firstTicket.customerEmail)" -ForegroundColor White
        Write-Host "  - Total Price: $($firstTicket.totalPrice)" -ForegroundColor White
        Write-Host "  - Status: $($firstTicket.status)" -ForegroundColor White
        if ($firstTicket.movie) {
            Write-Host "  - Movie: $($firstTicket.movie.title)" -ForegroundColor White
        }
        if ($firstTicket.showtime) {
            Write-Host "  - Showtime: $($firstTicket.showtime.startTime)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error testing tickets endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing /api/tickets/my-tickets endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$testUserId" -Method GET -ContentType "application/json"
    Write-Host "✅ My tickets endpoint response:" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object -and $response.object.Count -gt 0) {
        Write-Host "`nUser tickets details:" -ForegroundColor Cyan
        foreach ($ticket in $response.object) {
            Write-Host "  - Booking ID: $($ticket.id)" -ForegroundColor White
            Write-Host "    Customer: $($ticket.customerName)" -ForegroundColor White
            Write-Host "    Email: $($ticket.customerEmail)" -ForegroundColor White
            Write-Host "    Total: $($ticket.totalPrice)đ" -ForegroundColor White
            Write-Host "    Status: $($ticket.status)" -ForegroundColor White
            if ($ticket.movie) {
                Write-Host "    Movie: $($ticket.movie.title)" -ForegroundColor White
            }
            if ($ticket.showtime) {
                Write-Host "    Showtime: $($ticket.showtime.startTime)" -ForegroundColor White
            }
            Write-Host ""
        }
    } else {
        Write-Host "No tickets found for user ID: $testUserId" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error testing my-tickets endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing /api/user/{userId}/bookings endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/user/$testUserId/bookings" -Method GET -ContentType "application/json"
    Write-Host "✅ User bookings endpoint response:" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Bookings count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object -and $response.object.Count -gt 0) {
        Write-Host "`nUser bookings details:" -ForegroundColor Cyan
        foreach ($booking in $response.object) {
            Write-Host "  - Booking ID: $($booking.id)" -ForegroundColor White
            Write-Host "    Customer: $($booking.customerName)" -ForegroundColor White
            Write-Host "    Email: $($booking.customerEmail)" -ForegroundColor White
            Write-Host "    Total: $($booking.totalPrice)đ" -ForegroundColor White
            Write-Host "    Status: $($booking.status)" -ForegroundColor White
            if ($booking.movie) {
                Write-Host "    Movie: $($booking.movie.title)" -ForegroundColor White
            }
            if ($booking.showtime) {
                Write-Host "    Showtime: $($booking.showtime.startTime)" -ForegroundColor White
            }
            Write-Host ""
        }
    } else {
        Write-Host "No bookings found for user ID: $testUserId" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error testing user bookings endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Testing /api/booking endpoint (all bookings)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking" -Method GET -ContentType "application/json"
    Write-Host "✅ All bookings endpoint response:" -ForegroundColor Green
    Write-Host "Bookings count: $($response.Count)" -ForegroundColor White
    
    if ($response -and $response.Count -gt 0) {
        Write-Host "`nAll bookings (first 3):" -ForegroundColor Cyan
        $count = 0
        foreach ($booking in $response) {
            if ($count -ge 3) { break }
            Write-Host "  - Booking ID: $($booking.id)" -ForegroundColor White
            Write-Host "    Customer: $($booking.customerName)" -ForegroundColor White
            Write-Host "    Email: $($booking.customerEmail)" -ForegroundColor White
            Write-Host "    Total: $($booking.totalPrice)đ" -ForegroundColor White
            Write-Host "    Status: $($booking.status)" -ForegroundColor White
            if ($booking.movie) {
                Write-Host "    Movie: $($booking.movie.title)" -ForegroundColor White
            }
            Write-Host ""
            $count++
        }
    } else {
        Write-Host "No bookings found in system" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error testing all bookings endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Testing with authentication token..." -ForegroundColor Yellow
# Lấy token từ localStorage (nếu có)
$token = $null
try {
    # Thử đọc token từ file nếu có
    if (Test-Path "token.txt") {
        $token = Get-Content "token.txt" -Raw
        Write-Host "Using token from file: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    }
} catch {
    Write-Host "No token file found, testing without authentication" -ForegroundColor Yellow
}

if ($token) {
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$testUserId" -Method GET -Headers $headers
        Write-Host "✅ Authenticated my-tickets response:" -ForegroundColor Green
        Write-Host "Status: $($response.state)" -ForegroundColor White
        Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    } catch {
        Write-Host "❌ Error with authenticated request: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Summary:" -ForegroundColor Cyan
Write-Host "===========" -ForegroundColor Cyan
Write-Host "1. /api/tickets/test - Test endpoint (no auth)" -ForegroundColor White
Write-Host "2. /api/tickets/my-tickets?userId={id} - User tickets (no auth)" -ForegroundColor White
Write-Host "3. /api/user/{userId}/bookings - User bookings (requires auth)" -ForegroundColor White
Write-Host "4. /api/booking - All bookings (no auth)" -ForegroundColor White
Write-Host "`nRecommended for Profile page: Use /api/tickets/my-tickets?userId={id}" -ForegroundColor Green
