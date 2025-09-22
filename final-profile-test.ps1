# Final test script for Profile page auto-loading
Write-Host "🎬 Final Profile Page Test" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "`nThis script will help you test if Profile page auto-loads bookings" -ForegroundColor Yellow

Write-Host "`n1. API Status Check:" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
    Write-Host "✅ API is working - $($response.object.Count) tickets available" -ForegroundColor Green
    
    # Show available emails
    $emails = $response.object | ForEach-Object { $_.customerEmail } | Sort-Object | Get-Unique
    Write-Host "Available emails in system:" -ForegroundColor Cyan
    foreach ($email in $emails) {
        $count = ($response.object | Where-Object { $_.customerEmail -eq $email }).Count
        Write-Host "  📧 $email ($count tickets)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure backend server is running on port 8080" -ForegroundColor Yellow
}

Write-Host "`n2. Testing Steps:" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "1. Open browser to: http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12)" -ForegroundColor White
Write-Host "3. Go to Console tab" -ForegroundColor White
Write-Host "4. Look for these debug messages:" -ForegroundColor White
Write-Host "   🎯 [Profile] Starting fetchUserData..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Using email: [your-email]" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Initial load - trying test API..." -ForegroundColor Gray
Write-Host "   🎯 [Profile] Filtered user bookings: [array]" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Setting bookings state with X items" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Rendering bookings section, bookings.length: X" -ForegroundColor Gray

Write-Host "`n3. What to Look For:" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow
Write-Host "✅ If you see the debug logs above, the code is working" -ForegroundColor Green
Write-Host "✅ If bookings.length > 0, tickets should be visible" -ForegroundColor Green
Write-Host "❌ If bookings.length = 0, check email matching" -ForegroundColor Red
Write-Host "❌ If no logs appear, check if user is logged in" -ForegroundColor Red

Write-Host "`n4. Troubleshooting:" -ForegroundColor Red
Write-Host "===================" -ForegroundColor Red
Write-Host "• No logs at all: User not logged in or JavaScript error" -ForegroundColor White
Write-Host "• Logs show but bookings.length = 0: Email mismatch" -ForegroundColor White
Write-Host "• Logs show bookings but nothing visible: UI rendering issue" -ForegroundColor White
Write-Host "• Manual refresh works: Auto-load logic needs fixing" -ForegroundColor White

Write-Host "`n5. Quick Fix Test:" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta
Write-Host "If auto-load doesn't work, try:" -ForegroundColor White
Write-Host "• Click the 'Làm mới' button" -ForegroundColor White
Write-Host "• Check if bookings appear after manual refresh" -ForegroundColor White
Write-Host "• This confirms the API and filtering work correctly" -ForegroundColor White

Write-Host "`nReady to test! Open http://localhost:5173/profile now." -ForegroundColor Cyan
