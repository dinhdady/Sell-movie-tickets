# Test script cho Profile page với chi tiết booking
Write-Host "🎬 Testing Profile Page with Booking Details" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`n1. API Status Check:" -ForegroundColor Green
$baseUrl = "http://localhost:8080/api"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "✅ Primary API working - $($response.object.Count) tickets" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Profile Page Testing Steps:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Login if needed" -ForegroundColor White
Write-Host "3. Look for booking history section" -ForegroundColor White
Write-Host "4. Click on any booking to view details" -ForegroundColor White
Write-Host "5. Check if modal opens with booking details" -ForegroundColor White

Write-Host "`n3. Expected Features in Booking Detail Modal:" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Movie information (title, poster, duration)" -ForegroundColor Green
Write-Host "✅ Showtime information (date, time, room)" -ForegroundColor Green
Write-Host "✅ Cinema information (name, address, phone)" -ForegroundColor Green
Write-Host "✅ Seat information (seat number, type, price)" -ForegroundColor Green
Write-Host "✅ QR Code (generated if missing from API)" -ForegroundColor Green
Write-Host "✅ Customer information (name, email, phone, address)" -ForegroundColor Green
Write-Host "✅ Total price calculation" -ForegroundColor Green
Write-Host "✅ Booking status" -ForegroundColor Green

Write-Host "`n4. Mock Data Features:" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta
Write-Host "• If API data is incomplete, mock data will be generated:" -ForegroundColor White
Write-Host "  - QR Code: Generated using QR Server API" -ForegroundColor White
Write-Host "  - Seat: Default A1 seat" -ForegroundColor White
Write-Host "  - Token: Generated ticket token" -ForegroundColor White
Write-Host "  - Phone/Address: 'Chưa cập nhật' if missing" -ForegroundColor White

Write-Host "`n5. Debug Information:" -ForegroundColor Red
Write-Host "====================" -ForegroundColor Red
Write-Host "Open Developer Tools (F12) → Console" -ForegroundColor White
Write-Host "Look for these logs:" -ForegroundColor White
Write-Host "  🎯 [Profile] Fetching booking detail for ID: XXX" -ForegroundColor Gray
Write-Host "  🎯 [Profile] Enhanced booking data: [object]" -ForegroundColor Gray
Write-Host "  ⚠️ [Profile] Using enhanced basic booking info" -ForegroundColor Gray

Write-Host "`n6. Testing Checklist:" -ForegroundColor Blue
Write-Host "====================" -ForegroundColor Blue
Write-Host "□ Booking modal opens when clicking on booking" -ForegroundColor White
Write-Host "□ Movie poster and title are displayed" -ForegroundColor White
Write-Host "□ Showtime date and time are shown" -ForegroundColor White
Write-Host "□ Cinema name and address are visible" -ForegroundColor White
Write-Host "□ Seat information is displayed (A1 or actual seat)" -ForegroundColor White
Write-Host "□ QR Code is generated and visible" -ForegroundColor White
Write-Host "□ Customer phone and address are shown" -ForegroundColor White
Write-Host "□ Total price is calculated correctly" -ForegroundColor White
Write-Host "□ Modal can be closed properly" -ForegroundColor White

Write-Host "`nReady to test Profile page with booking details!" -ForegroundColor Cyan
