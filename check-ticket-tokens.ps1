# Script để kiểm tra token trong tickets API
Write-Host "🔍 Checking Ticket Tokens from API" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

Write-Host "`n1. Testing /api/tickets/test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ API Response Status: $($response.state)" -ForegroundColor Green
    Write-Host "Total tickets: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`n📋 Sample Ticket Structure:" -ForegroundColor Cyan
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Customer: $($ticket.customerName)" -ForegroundColor White
        Write-Host "Email: $($ticket.customerEmail)" -ForegroundColor White
        Write-Host "Total Price: $($ticket.totalPrice)đ" -ForegroundColor White
        Write-Host "Status: $($ticket.paymentStatus)" -ForegroundColor White
        
        Write-Host "`n🎫 Order Structure:" -ForegroundColor Cyan
        if ($ticket.order) {
            Write-Host "Order ID: $($ticket.order.id)" -ForegroundColor White
            Write-Host "Order Status: $($ticket.order.status)" -ForegroundColor White
            Write-Host "Order Total: $($ticket.order.totalPrice)đ" -ForegroundColor White
            Write-Host "Tickets Count: $($ticket.order.tickets.Count)" -ForegroundColor White
            
            if ($ticket.order.tickets -and $ticket.order.tickets.Count -gt 0) {
                Write-Host "`n🎟️ First Ticket Details:" -ForegroundColor Cyan
                $firstTicket = $ticket.order.tickets[0]
                Write-Host "Ticket ID: $($firstTicket.id)" -ForegroundColor White
                Write-Host "Token: $($firstTicket.token)" -ForegroundColor White
                Write-Host "Price: $($firstTicket.price)đ" -ForegroundColor White
                Write-Host "Status: $($firstTicket.status)" -ForegroundColor White
                Write-Host "QR Code URL: $($firstTicket.qrCodeUrl)" -ForegroundColor White
                Write-Host "Seat: $($firstTicket.seat.seatNumber)" -ForegroundColor White
                Write-Host "Seat Type: $($firstTicket.seat.seatType)" -ForegroundColor White
            } else {
                Write-Host "❌ No tickets in order" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No order information" -ForegroundColor Red
        }
        
        # Check if there are any tokens at root level
        Write-Host "`n🔍 Root Level Token Check:" -ForegroundColor Cyan
        if ($ticket.token) {
            Write-Host "Root Token: $($ticket.token)" -ForegroundColor White
        } else {
            Write-Host "No root level token" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing other endpoints for tokens..." -ForegroundColor Yellow

# Test booking endpoint
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/booking" -Method GET
    Write-Host "✅ /api/booking endpoint working" -ForegroundColor Green
    if ($response.Count -gt 0) {
        $booking = $response[0]
        Write-Host "Sample booking token: $($booking.token)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ /api/booking error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Analysis:" -ForegroundColor Cyan
Write-Host "===========" -ForegroundColor Cyan
Write-Host "Check if tokens are available in:" -ForegroundColor White
Write-Host "• order.tickets[].token (UUID format)" -ForegroundColor White
Write-Host "• Root level token field" -ForegroundColor White
Write-Host "• Other nested structures" -ForegroundColor White
