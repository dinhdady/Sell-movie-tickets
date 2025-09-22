# Test script cho QR code với token thực
Write-Host "🎬 Testing QR Code with Real Token" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`n1. API Status Check:" -ForegroundColor Green
$baseUrl = "http://localhost:8080/api"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ API Status: Working ($($response.object.Count) tickets)" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nSample ticket data:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Customer: $($ticket.customerName)" -ForegroundColor White
        Write-Host "Email: $($ticket.customerEmail)" -ForegroundColor White
        Write-Host "Movie: $($ticket.movie.title)" -ForegroundColor White
        Write-Host "Price: $($ticket.totalPrice)đ" -ForegroundColor White
        Write-Host "Status: $($ticket.paymentStatus)" -ForegroundColor White
        
        Write-Host "`nOrder info:" -ForegroundColor Yellow
        if ($ticket.order) {
            Write-Host "Order ID: $($ticket.order.id)" -ForegroundColor White
            Write-Host "Tickets count: $($ticket.order.tickets.Count)" -ForegroundColor White
            if ($ticket.order.tickets.Count -gt 0) {
                $firstTicket = $ticket.order.tickets[0]
                Write-Host "First ticket token: $($firstTicket.token)" -ForegroundColor White
                Write-Host "QR Code URL: $($firstTicket.qrCodeUrl)" -ForegroundColor White
            }
        }
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. QR Code Testing Steps:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Click on any booking to view details" -ForegroundColor White
Write-Host "3. Check QR code in the modal" -ForegroundColor White
Write-Host "4. Scan QR code to verify content" -ForegroundColor White

Write-Host "`n3. Expected QR Code Content:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "The QR code should contain JSON data with:" -ForegroundColor White
Write-Host "• bookingId: Booking ID" -ForegroundColor White
Write-Host "• token: Ticket token (TKT{id}_{user}_{timestamp})" -ForegroundColor White
Write-Host "• customerEmail: Customer email" -ForegroundColor White
Write-Host "• customerName: Customer name" -ForegroundColor White
Write-Host "• movieTitle: Movie title" -ForegroundColor White
Write-Host "• showtime: Showtime date" -ForegroundColor White
Write-Host "• totalPrice: Total price" -ForegroundColor White
Write-Host "• status: Payment status" -ForegroundColor White
Write-Host "• generatedAt: Generation timestamp" -ForegroundColor White

Write-Host "`n4. QR Code Generation Logic:" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta
Write-Host "• If API has real token: Use real token" -ForegroundColor White
Write-Host "• If no real token: Generate TKT{id}_{user}_{timestamp}" -ForegroundColor White
Write-Host "• QR data: JSON with all booking information" -ForegroundColor White
Write-Host "• QR URL: https://api.qrserver.com/v1/create-qr-code/" -ForegroundColor White

Write-Host "`n5. Testing Checklist:" -ForegroundColor Blue
Write-Host "====================" -ForegroundColor Blue
Write-Host "□ QR code is displayed in modal" -ForegroundColor White
Write-Host "□ QR code contains valid JSON data" -ForegroundColor White
Write-Host "□ Token format is correct (TKT{id}_{user}_{timestamp})" -ForegroundColor White
Write-Host "□ All booking information is in QR data" -ForegroundColor White
Write-Host "□ QR code is scannable" -ForegroundColor White
Write-Host "□ Token matches the displayed token" -ForegroundColor White

Write-Host "`nReady to test QR code with real token!" -ForegroundColor Cyan
