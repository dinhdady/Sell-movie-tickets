# Script để kiểm tra chi tiết dữ liệu booking từ API
Write-Host "🔍 Checking Booking Details from API" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

Write-Host "`n1. Testing /api/tickets/test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ API Response Status: $($response.state)" -ForegroundColor Green
    Write-Host "Total tickets: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $sampleTicket = $response.object[0]
        Write-Host "`n📋 Sample Ticket Details:" -ForegroundColor Cyan
        Write-Host "ID: $($sampleTicket.id)" -ForegroundColor White
        Write-Host "Customer: $($sampleTicket.customerName)" -ForegroundColor White
        Write-Host "Email: $($sampleTicket.customerEmail)" -ForegroundColor White
        Write-Host "Phone: $($sampleTicket.customerPhone)" -ForegroundColor White
        Write-Host "Address: $($sampleTicket.customerAddress)" -ForegroundColor White
        Write-Host "Total Price: $($sampleTicket.totalPrice)đ" -ForegroundColor White
        Write-Host "Status: $($sampleTicket.paymentStatus)" -ForegroundColor White
        
        Write-Host "`n🎬 Movie Info:" -ForegroundColor Cyan
        Write-Host "Title: $($sampleTicket.movie.title)" -ForegroundColor White
        Write-Host "Poster: $($sampleTicket.movie.posterUrl)" -ForegroundColor White
        
        Write-Host "`n🎭 Showtime Info:" -ForegroundColor Cyan
        Write-Host "Start Time: $($sampleTicket.showtime.startTime)" -ForegroundColor White
        Write-Host "End Time: $($sampleTicket.showtime.endTime)" -ForegroundColor White
        Write-Host "Room: $($sampleTicket.showtime.room.name)" -ForegroundColor White
        Write-Host "Cinema: $($sampleTicket.showtime.room.cinema.name)" -ForegroundColor White
        
        Write-Host "`n🎫 Order Info:" -ForegroundColor Cyan
        if ($sampleTicket.order) {
            Write-Host "Order ID: $($sampleTicket.order.id)" -ForegroundColor White
            Write-Host "Order Status: $($sampleTicket.order.status)" -ForegroundColor White
            Write-Host "Order Total: $($sampleTicket.order.totalPrice)đ" -ForegroundColor White
            Write-Host "Order Phone: $($sampleTicket.order.customerPhone)" -ForegroundColor White
            Write-Host "Order Address: $($sampleTicket.order.customerAddress)" -ForegroundColor White
            Write-Host "Tickets Count: $($sampleTicket.order.tickets.Count)" -ForegroundColor White
            
            if ($sampleTicket.order.tickets -and $sampleTicket.order.tickets.Count -gt 0) {
                Write-Host "`n🎟️ First Ticket Details:" -ForegroundColor Cyan
                $firstTicket = $sampleTicket.order.tickets[0]
                Write-Host "Ticket ID: $($firstTicket.id)" -ForegroundColor White
                Write-Host "Seat: $($firstTicket.seat.seatNumber)" -ForegroundColor White
                Write-Host "Seat Type: $($firstTicket.seat.seatType)" -ForegroundColor White
                Write-Host "Price: $($firstTicket.price)đ" -ForegroundColor White
                Write-Host "Status: $($firstTicket.status)" -ForegroundColor White
                Write-Host "Token: $($firstTicket.token)" -ForegroundColor White
                Write-Host "QR Code URL: $($firstTicket.qrCodeUrl)" -ForegroundColor White
            } else {
                Write-Host "❌ No tickets in order" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No order information" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing booking detail endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking/223/details" -Method GET
    Write-Host "✅ Booking detail API working" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Booking detail API error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Analysis:" -ForegroundColor Cyan
Write-Host "===========" -ForegroundColor Cyan
Write-Host "Check if the following data is available:" -ForegroundColor White
Write-Host "• QR Code URL in order.tickets[0].qrCodeUrl" -ForegroundColor White
Write-Host "• Phone number in customerPhone or order.customerPhone" -ForegroundColor White
Write-Host "• Address in customerAddress or order.customerAddress" -ForegroundColor White
Write-Host "• Seat details in order.tickets[].seat" -ForegroundColor White
Write-Host "• Ticket tokens in order.tickets[].token" -ForegroundColor White
