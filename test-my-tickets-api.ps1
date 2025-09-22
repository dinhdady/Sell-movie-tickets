# Test script for my-tickets API
Write-Host "🎬 Testing My Tickets API" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "`nTesting my-tickets API for logged-in user..." -ForegroundColor Green

# Test my-tickets API with a sample user ID
$userId = "1"  # Sample user ID
$baseUrl = "http://localhost:8080/api"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$userId" -Method GET
    Write-Host "✅ My Tickets API Status: Working" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Tickets count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`nSample user ticket:" -ForegroundColor Yellow
        Write-Host "ID: $($ticket.id)" -ForegroundColor White
        Write-Host "Token: $($ticket.token)" -ForegroundColor White
        Write-Host "Price: $($ticket.price)đ" -ForegroundColor White
        Write-Host "Status: $($ticket.status)" -ForegroundColor White
        Write-Host "Customer: $($ticket.customerEmail)" -ForegroundColor White
        Write-Host "Movie: $($ticket.movieTitle)" -ForegroundColor White
        
        if ($ticket.seatNumber) {
            Write-Host "`nSeat information:" -ForegroundColor Cyan
            Write-Host "Seat Number: $($ticket.seatNumber)" -ForegroundColor White
            Write-Host "Seat Type: $($ticket.seatType)" -ForegroundColor White
            Write-Host "Row: $($ticket.rowNumber)" -ForegroundColor White
            Write-Host "Column: $($ticket.columnNumber)" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️ No tickets found for user $userId" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ My Tickets API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to:" -ForegroundColor Yellow
    Write-Host "• User not found" -ForegroundColor White
    Write-Host "• No tickets for this user" -ForegroundColor White
    Write-Host "• Authentication required" -ForegroundColor White
}

Write-Host "`nTesting Steps:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Login with a user account" -ForegroundColor White
Write-Host "3. Check console logs for:" -ForegroundColor White
Write-Host "   🎯 [Profile] Trying my-tickets API for user ID: X" -ForegroundColor Gray
Write-Host "   🎯 [Profile] My tickets API response: [array]" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Found user tickets: X" -ForegroundColor Gray
Write-Host "4. Verify only user's tickets are shown" -ForegroundColor White

Write-Host "`nExpected Results:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ Only tickets for logged-in user" -ForegroundColor Green
Write-Host "✅ Real token from database" -ForegroundColor Green
Write-Host "✅ Complete ticket information" -ForegroundColor Green
Write-Host "✅ Proper seat information" -ForegroundColor Green
Write-Host "✅ Sorted by newest first" -ForegroundColor Green

Write-Host "`nAPI Endpoint:" -ForegroundColor Magenta
Write-Host "=============" -ForegroundColor Magenta
Write-Host "GET /api/tickets/my-tickets?userId={userId}" -ForegroundColor White
Write-Host "Returns: List of tickets for specific user" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
