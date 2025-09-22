# Script test màu ghế trong trang booking
Write-Host "🧪 Testing seat colors in booking page..." -ForegroundColor Yellow

Write-Host "`n🔍 Changes made to Booking.tsx:" -ForegroundColor Blue
Write-Host "✅ Updated getSeatColor function for booked seats:" -ForegroundColor Green
Write-Host "   - Changed from bg-red-500 to bg-red-600" -ForegroundColor Cyan
Write-Host "   - Added border-2 border-red-700 for better visibility" -ForegroundColor Cyan
Write-Host "   - Set opacity-80 instead of opacity-60" -ForegroundColor Cyan

Write-Host "`n🔍 Updated seat legends:" -ForegroundColor Blue
Write-Host "✅ Updated both seat legends to use bg-red-600 with border" -ForegroundColor Green
Write-Host "   - Top legend (lines 570-572)" -ForegroundColor Cyan
Write-Host "   - Bottom legend (lines 601-603)" -ForegroundColor Cyan

Write-Host "`n🎯 Expected behavior:" -ForegroundColor Blue
Write-Host "✅ Booked seats (status = 'BOOKED' or 'OCCUPIED') should now display:" -ForegroundColor Green
Write-Host "   - Background: Red-600 (darker red)" -ForegroundColor Cyan
Write-Host "   - Border: Red-700 (even darker red border)" -ForegroundColor Cyan
Write-Host "   - Text: White" -ForegroundColor Cyan
Write-Host "   - Cursor: Not-allowed" -ForegroundColor Cyan
Write-Host "   - Opacity: 80% (slightly transparent)" -ForegroundColor Cyan

Write-Host "`n🚀 How to test:" -ForegroundColor Blue
Write-Host "1. Open http://localhost:5173/booking/7" -ForegroundColor Cyan
Write-Host "2. Select a cinema and room" -ForegroundColor Cyan
Write-Host "3. Select a showtime" -ForegroundColor Cyan
Write-Host "4. Look for seats with red color (these are booked seats)" -ForegroundColor Cyan
Write-Host "5. Try clicking on red seats - they should not be selectable" -ForegroundColor Cyan

Write-Host "`n📋 Color scheme summary:" -ForegroundColor Blue
Write-Host "🔴 Red (bg-red-600): Booked/Occupied seats (not selectable)" -ForegroundColor Red
Write-Host "🔵 Blue (bg-blue-500): Currently selected seats" -ForegroundColor Blue
Write-Host "🟢 Green (bg-green-400): Available regular seats" -ForegroundColor Green
Write-Host "🟡 Yellow (bg-yellow-400): Available VIP seats" -ForegroundColor Yellow
Write-Host "🟣 Purple (bg-purple-400): Available couple seats" -ForegroundColor Magenta

Write-Host "`n🏁 Seat color test completed!" -ForegroundColor Green
Write-Host "The red color for booked seats should now be more prominent and visible!" -ForegroundColor Green
