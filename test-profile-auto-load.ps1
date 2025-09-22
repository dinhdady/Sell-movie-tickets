# Test script để kiểm tra Profile page tự động load vé
Write-Host "🎬 Testing Profile Page Auto-Load" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

Write-Host "`n1. Testing /api/tickets/test endpoint (primary source)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ Success! Found $($response.object.Count) total tickets" -ForegroundColor Green
    
    # Test filtering by specific emails
    $emails = @("dinhhoang2207004@gmail.com", "hoangphuong16680@gmail.com")
    
    foreach ($email in $emails) {
        $userTickets = $response.object | Where-Object { $_.customerEmail -eq $email }
        Write-Host "`n📧 Tickets for $email : $($userTickets.Count)" -ForegroundColor Cyan
        
        if ($userTickets.Count -gt 0) {
            Write-Host "  Sample ticket:" -ForegroundColor Yellow
            $sample = $userTickets[0]
            Write-Host "    ID: $($sample.id)" -ForegroundColor White
            Write-Host "    Movie: $($sample.movie.title)" -ForegroundColor White
            Write-Host "    Total: $($sample.totalPrice)đ" -ForegroundColor White
            Write-Host "    Status: $($sample.paymentStatus)" -ForegroundColor White
            Write-Host "    Created: $($sample.createdAt)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing user profile endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/user/profile" -Method GET
    Write-Host "✅ Profile endpoint accessible" -ForegroundColor Green
    Write-Host "User email: $($response.object.email)" -ForegroundColor White
} catch {
    Write-Host "❌ Profile endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to missing authentication token" -ForegroundColor Yellow
}

Write-Host "`n🎯 Expected Behavior:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "1. When user visits /profile page" -ForegroundColor White
Write-Host "2. Page should automatically call /api/tickets/test" -ForegroundColor White
Write-Host "3. Filter tickets by user's email" -ForegroundColor White
Write-Host "4. Display tickets without needing to click 'Làm mới'" -ForegroundColor White

Write-Host "`n🔧 Debug Steps:" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host "1. Open browser console (F12)" -ForegroundColor White
Write-Host "2. Go to http://localhost:5173/profile" -ForegroundColor White
Write-Host "3. Look for console logs starting with '🎯 [Profile]'" -ForegroundColor White
Write-Host "4. Check if 'Initial load - trying test API' appears" -ForegroundColor White
Write-Host "5. Check if 'Filtered user bookings' shows the tickets" -ForegroundColor White

Write-Host "`n💡 If still not working:" -ForegroundColor Red
Write-Host "========================" -ForegroundColor Red
Write-Host "1. Check if user is logged in (authUser.email exists)" -ForegroundColor White
Write-Host "2. Check if test API is returning data" -ForegroundColor White
Write-Host "3. Check if email filtering is working correctly" -ForegroundColor White
Write-Host "4. Check browser network tab for failed requests" -ForegroundColor White
