# Test script for real token from API
Write-Host "🎬 Testing Real Token from API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "`n1. Testing /api/test/tickets-with-tokens endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/tickets-with-tokens" -Method GET
    Write-Host "✅ API Status: $($response.state)" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        Write-Host "`n📋 Sample Ticket with Real Token:" -ForegroundColor Cyan
        $ticket = $response.object[0]
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)" -ForegroundColor White
        Write-Host "Status: $($ticket.status)" -ForegroundColor White
        Write-Host "QR Code URL: $($ticket.qrCodeUrl)" -ForegroundColor White
        Write-Host "Used: $($ticket.used)" -ForegroundColor White
        
        if ($ticket.seat) {
            Write-Host "`n🎟️ Seat Info:" -ForegroundColor Cyan
            Write-Host "Seat Number: $($ticket.seat.seatNumber)" -ForegroundColor White
            Write-Host "Seat Type: $($ticket.seat.seatType)" -ForegroundColor White
            Write-Host "Row: $($ticket.seat.rowNumber)" -ForegroundColor White
            Write-Host "Column: $($ticket.seat.columnNumber)" -ForegroundColor White
        }
        
        if ($ticket.order) {
            Write-Host "`n📦 Order Info:" -ForegroundColor Cyan
            Write-Host "Order ID: $($ticket.order.id)" -ForegroundColor White
            Write-Host "Customer Email: $($ticket.order.customerEmail)" -ForegroundColor White
            Write-Host "Total Price: $($ticket.order.totalPrice)" -ForegroundColor White
            Write-Host "Order Status: $($ticket.order.status)" -ForegroundColor White
        }
        
        Write-Host "`n🎯 Token Analysis:" -ForegroundColor Magenta
        Write-Host "Token Format: $($ticket.token)" -ForegroundColor White
        Write-Host "Token Length: $($ticket.token.Length)" -ForegroundColor White
        Write-Host "Is UUID: $($ticket.token -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')" -ForegroundColor White
    } else {
        Write-Host "❌ No tickets found in database" -ForegroundColor Red
        Write-Host "This means no bookings have been made yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Profile Page Integration:" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Check console logs for:" -ForegroundColor White
Write-Host "   🎯 [Profile] Trying tickets with tokens API..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Found bookings with real tokens: X" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Sample booking with token: [object]" -ForegroundColor Gray
Write-Host "3. Click on any booking to view details" -ForegroundColor White
Write-Host "4. Verify QR code contains real token from database" -ForegroundColor White

Write-Host "`n3. Expected Results:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "✅ Real token from database (UUID format)" -ForegroundColor Green
Write-Host "✅ QR code contains real token" -ForegroundColor Green
Write-Host "✅ No mock/generated tokens" -ForegroundColor Green
Write-Host "✅ Token matches database token" -ForegroundColor Green

Write-Host "`n4. Token Format Examples:" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host "Real tokens from database:" -ForegroundColor White
Write-Host "• d1ec0b24-782c-4101-bb35-5bccb286469b" -ForegroundColor White
Write-Host "• a1b2c3d4-e5f6-7890-abcd-ef1234567890" -ForegroundColor White
Write-Host "• 12345678-1234-5678-9abc-def123456789" -ForegroundColor White

Write-Host "`nReady to test real token integration!" -ForegroundColor Cyan
