# Test script cho Admin Bookings Page
Write-Host "🎬 Testing Admin Bookings Page" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "`n1. API Status Check:" -ForegroundColor Green
$baseUrl = "http://localhost:8080/api"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ Primary API working - $($response.object.Count) tickets" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    
    # Show sample data
    if ($response.object.Count -gt 0) {
        Write-Host "`nSample tickets for admin:" -ForegroundColor Cyan
        $count = 0
        foreach ($ticket in $response.object) {
            if ($count -ge 5) { break }
            Write-Host "  ID: $($ticket.id)" -ForegroundColor White
            Write-Host "  Customer: $($ticket.customerName)" -ForegroundColor White
            Write-Host "  Email: $($ticket.customerEmail)" -ForegroundColor White
            Write-Host "  Movie: $($ticket.movie.title)" -ForegroundColor White
            Write-Host "  Price: $($ticket.totalPrice)đ" -ForegroundColor White
            Write-Host "  Status: $($ticket.paymentStatus)" -ForegroundColor White
            Write-Host "  Created: $($ticket.createdAt)" -ForegroundColor White
            Write-Host ""
            $count++
        }
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Instructions:" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/admin/bookings" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12) → Console" -ForegroundColor White
Write-Host "3. Look for these logs:" -ForegroundColor White
Write-Host "   🎯 [Admin] Fetching all bookings..." -ForegroundColor Gray
Write-Host "   🎯 [Admin] Trying test tickets API (primary)..." -ForegroundColor Gray
Write-Host "   🎯 [Admin] Test tickets count: 24" -ForegroundColor Gray
Write-Host "   🎯 [Admin] Sample ticket: [object]" -ForegroundColor Gray

Write-Host "`n3. Expected Behavior:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "✅ Page should load automatically" -ForegroundColor Green
Write-Host "✅ Show 24 tickets in the table" -ForegroundColor Green
Write-Host "✅ Search and filter should work" -ForegroundColor Green
Write-Host "✅ Click 'Test API' button for debugging" -ForegroundColor Green
Write-Host "✅ Click 'Làm mới' to refresh data" -ForegroundColor Green

Write-Host "`n4. Features to Test:" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta
Write-Host "• Search by customer name, email, or movie title" -ForegroundColor White
Write-Host "• Filter by status (ALL, PAID, PENDING, etc.)" -ForegroundColor White
Write-Host "• Pagination (30 items per page)" -ForegroundColor White
Write-Host "• View booking details (click on booking)" -ForegroundColor White
Write-Host "• Export to CSV" -ForegroundColor White
Write-Host "• Status management" -ForegroundColor White

Write-Host "`n5. Debug Information:" -ForegroundColor Red
Write-Host "====================" -ForegroundColor Red
Write-Host "If page doesn't load:" -ForegroundColor White
Write-Host "• Check console for JavaScript errors" -ForegroundColor White
Write-Host "• Check network tab for failed requests" -ForegroundColor White
Write-Host "• Click 'Test API' button to debug" -ForegroundColor White
Write-Host "• Verify backend server is running" -ForegroundColor White

Write-Host "`n6. API Endpoints Used:" -ForegroundColor Blue
Write-Host "=====================" -ForegroundColor Blue
Write-Host "Primary: /api/tickets/test (no auth required)" -ForegroundColor White
Write-Host "Fallback 1: /api/tickets (requires auth)" -ForegroundColor White
Write-Host "Fallback 2: /api/admin/bookings (requires auth)" -ForegroundColor White
Write-Host "Fallback 3: /api/booking (all bookings)" -ForegroundColor White
Write-Host "Details: /api/booking/{id}/details (for modal)" -ForegroundColor White

Write-Host "`nReady to test admin bookings page!" -ForegroundColor Cyan

