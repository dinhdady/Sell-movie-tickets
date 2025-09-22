# Script test booking API endpoints
Write-Host "🧪 Testing booking API endpoints..." -ForegroundColor Yellow

Write-Host "`n🔍 Testing API Endpoints:" -ForegroundColor Blue

Write-Host "`n1. Test GET /api/booking (Get all bookings):" -ForegroundColor Cyan
Write-Host "curl -X GET http://localhost:8080/api/booking" -ForegroundColor White
Write-Host "Expected: Array of booking objects with movie, showtime, order details" -ForegroundColor Green

Write-Host "`n2. Test GET /api/booking/{id}/details (Get booking details):" -ForegroundColor Cyan
Write-Host "curl -X GET http://localhost:8080/api/booking/1/details" -ForegroundColor White
Write-Host "Expected: Detailed booking object with tickets and QR codes" -ForegroundColor Green

Write-Host "`n3. Test POST /api/booking (Create booking):" -ForegroundColor Cyan
Write-Host "curl -X POST http://localhost:8080/api/booking -H 'Content-Type: application/json' -d '{"showtimeId": 1, "totalPrice": 80000, "customerName": "Test User", "customerEmail": "test@example.com"}'" -ForegroundColor White
Write-Host "Expected: Created booking object" -ForegroundColor Green

Write-Host "`n4. Test VNPay callback:" -ForegroundColor Cyan
Write-Host "curl -X GET 'http://localhost:8080/api/vnpay/return?status=success&txnRef=test123'" -ForegroundColor White
Write-Host "Expected: Redirect to frontend with success status" -ForegroundColor Green

Write-Host "`n🔍 Testing Frontend Pages:" -ForegroundColor Blue

Write-Host "`n1. User Profile (http://localhost:5173/profile):" -ForegroundColor Cyan
Write-Host "   - Should show booking history" -ForegroundColor Green
Write-Host "   - Should have refresh button" -ForegroundColor Green
Write-Host "   - Should show booking details on click" -ForegroundColor Green

Write-Host "`n2. Admin Booking Management (http://localhost:5173/admin/booking-management):" -ForegroundColor Cyan
Write-Host "   - Should show all bookings" -ForegroundColor Green
Write-Host "   - Should have search and filter" -ForegroundColor Green
Write-Host "   - Should show booking details modal" -ForegroundColor Green

Write-Host "`n3. Booking Page (http://localhost:5173/booking/7):" -ForegroundColor Cyan
Write-Host "   - Should show seat selection" -ForegroundColor Green
Write-Host "   - Should create booking on payment" -ForegroundColor Green
Write-Host "   - Should redirect to payment callback" -ForegroundColor Green

Write-Host "`n🔧 Debug Information:" -ForegroundColor Blue
Write-Host "1. Check browser console for API calls" -ForegroundColor Cyan
Write-Host "2. Check backend logs for booking creation" -ForegroundColor Cyan
Write-Host "3. Check database for booking records" -ForegroundColor Cyan
Write-Host "4. Verify payment callback processing" -ForegroundColor Cyan

Write-Host "`n📋 Expected Database Records:" -ForegroundColor Blue
Write-Host "✅ bookings table - booking records" -ForegroundColor Green
Write-Host "✅ orders table - order records" -ForegroundColor Green
Write-Host "✅ tickets table - ticket records" -ForegroundColor Green
Write-Host "✅ showtime_seat_bookings table - seat reservations" -ForegroundColor Green

Write-Host "`n🏁 Test script completed!" -ForegroundColor Green
Write-Host "Run these tests to verify booking flow works correctly." -ForegroundColor Green
