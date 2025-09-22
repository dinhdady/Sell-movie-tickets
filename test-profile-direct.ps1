# Direct test of Profile page functionality
Write-Host "Testing Profile Page Directly..." -ForegroundColor Green

# Test 1: Check if API is working
Write-Host "`n1. Testing API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "✅ API working - $($response.object.Count) tickets found" -ForegroundColor Green
    
    # Count tickets by email
    $emailCounts = @{}
    foreach ($ticket in $response.object) {
        $email = $ticket.customerEmail
        if ($emailCounts.ContainsKey($email)) {
            $emailCounts[$email]++
        } else {
            $emailCounts[$email] = 1
        }
    }
    
    Write-Host "`nTickets by email:" -ForegroundColor Cyan
    foreach ($email in $emailCounts.Keys) {
        Write-Host "  $email : $($emailCounts[$email]) tickets" -ForegroundColor White
    }
} catch {
    Write-Host "❌ API error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Instructions for testing Profile page:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "1. Open browser to http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12)" -ForegroundColor White
Write-Host "3. Go to Console tab" -ForegroundColor White
Write-Host "4. Look for logs starting with '🎯 [Profile]'" -ForegroundColor White
Write-Host "5. Check if bookings appear automatically" -ForegroundColor White

Write-Host "`n3. Expected console logs:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "🎯 [Profile] Starting fetchUserData..." -ForegroundColor Gray
Write-Host "🎯 [Profile] Using email: [your-email]" -ForegroundColor Gray
Write-Host "🎯 [Profile] Initial load - trying test API..." -ForegroundColor Gray
Write-Host "🎯 [Profile] Filtered user bookings: [array of bookings]" -ForegroundColor Gray

Write-Host "`n4. If you see these logs but no bookings:" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host "• Check if your email matches the emails in the API response" -ForegroundColor White
Write-Host "• The filtering might not be working correctly" -ForegroundColor White
Write-Host "• Try clicking 'Làm mới' to test manual refresh" -ForegroundColor White
