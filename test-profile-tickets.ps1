# Script đơn giản để test API lấy vé đã đặt cho trang Profile
# Sử dụng endpoint /api/tickets/my-tickets?userId={id}

Write-Host "🎬 Testing Profile Tickets API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$testUserId = "1"  # Thay đổi theo user ID thực tế

Write-Host "`nTesting endpoint: $baseUrl/tickets/my-tickets?userId=$testUserId" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$testUserId" -Method GET -ContentType "application/json"
    
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object -and $response.object.Count -gt 0) {
        Write-Host "`n📋 User Tickets Details:" -ForegroundColor Cyan
        Write-Host "========================" -ForegroundColor Cyan
        
        foreach ($ticket in $response.object) {
            Write-Host "`n🎫 Booking ID: $($ticket.id)" -ForegroundColor Yellow
            Write-Host "   Customer: $($ticket.customerName)" -ForegroundColor White
            Write-Host "   Email: $($ticket.customerEmail)" -ForegroundColor White
            Write-Host "   Total Price: $($ticket.totalPrice)đ" -ForegroundColor White
            Write-Host "   Status: $($ticket.status)" -ForegroundColor White
            Write-Host "   Created: $($ticket.createdAt)" -ForegroundColor White
            
            if ($ticket.movie) {
                Write-Host "   Movie: $($ticket.movie.title)" -ForegroundColor Green
                if ($ticket.movie.posterUrl) {
                    Write-Host "   Poster: $($ticket.movie.posterUrl)" -ForegroundColor Gray
                }
            }
            
            if ($ticket.showtime) {
                Write-Host "   Showtime: $($ticket.showtime.startTime)" -ForegroundColor Blue
                if ($ticket.showtime.room) {
                    Write-Host "   Room: $($ticket.showtime.room.name)" -ForegroundColor Blue
                    if ($ticket.showtime.room.cinema) {
                        Write-Host "   Cinema: $($ticket.showtime.room.cinema.name)" -ForegroundColor Blue
                    }
                }
            }
            
            if ($ticket.order -and $ticket.order.tickets) {
                Write-Host "   Tickets: $($ticket.order.tickets.Count) seats" -ForegroundColor Magenta
                foreach ($seat in $ticket.order.tickets) {
                    Write-Host "     - Seat: $($seat.seat.seatNumber) ($($seat.seat.seatType)) - $($seat.price)đ" -ForegroundColor Gray
                }
            }
        }
        
        Write-Host "`n✅ API call successful! Found $($response.object.Count) tickets for user $testUserId" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ No tickets found for user ID: $testUserId" -ForegroundColor Yellow
        Write-Host "This could mean:" -ForegroundColor White
        Write-Host "1. User has not made any bookings yet" -ForegroundColor White
        Write-Host "2. User ID is incorrect" -ForegroundColor White
        Write-Host "3. Database does not have ticket data" -ForegroundColor White
    }
    
} catch {
    Write-Host "`n❌ Error calling API:" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "Suggestion: Check if user ID exists" -ForegroundColor Yellow
        } elseif ($statusCode -eq 500) {
            Write-Host "Suggestion: Check backend server logs" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. If successful: The Profile page should display these tickets" -ForegroundColor White
Write-Host "2. If no tickets: Try creating a booking first" -ForegroundColor White
Write-Host "3. If error: Check backend server is running on port 8080" -ForegroundColor White
Write-Host "4. Test with different user ID if needed" -ForegroundColor White