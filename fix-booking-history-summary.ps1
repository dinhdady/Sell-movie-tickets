# Script tổng hợp sửa lỗi booking history
Write-Host "🔧 Fixing booking history display issue..." -ForegroundColor Yellow

Write-Host "`n📋 Issues Identified and Fixed:" -ForegroundColor Blue

Write-Host "`n✅ 1. API Response Type Mismatch:" -ForegroundColor Green
Write-Host "   - Frontend expected ApiBooking[] but backend returned BookingDetailsResponse[]" -ForegroundColor Cyan
Write-Host "   - Fixed: Updated ApiBooking interface to match BookingDetailsResponse" -ForegroundColor Cyan
Write-Host "   - Fixed: Updated bookingAPI.getAll() to handle correct response type" -ForegroundColor Cyan

Write-Host "`n✅ 2. Frontend Data Processing:" -ForegroundColor Green
Write-Host "   - Added console logging for debugging API responses" -ForegroundColor Cyan
Write-Host "   - Updated Profile.tsx to handle new response structure" -ForegroundColor Cyan
Write-Host "   - Updated BookingManagement.tsx to handle new response structure" -ForegroundColor Cyan

Write-Host "`n✅ 3. Booking Flow Analysis:" -ForegroundColor Green
Write-Host "   - Backend VNPayService.handlePaymentReturn() processes payment" -ForegroundColor Cyan
Write-Host "   - Backend BookingService.confirmPaymentAndGenerateTickets() creates tickets" -ForegroundColor Cyan
Write-Host "   - Backend BookingController.getAll() returns all bookings" -ForegroundColor Cyan
Write-Host "   - Frontend filters bookings by customerEmail" -ForegroundColor Cyan

Write-Host "`n🔍 Key Changes Made:" -ForegroundColor Blue

Write-Host "`n1. frontend/src/services/api.ts:" -ForegroundColor Cyan
Write-Host "   - Updated ApiBooking interface to match backend response" -ForegroundColor White
Write-Host "   - Added optional fields for better compatibility" -ForegroundColor White
Write-Host "   - Updated bookingAPI.getAll() to cast response correctly" -ForegroundColor White

Write-Host "`n2. frontend/src/pages/Profile.tsx:" -ForegroundColor Cyan
Write-Host "   - Added detailed console logging for debugging" -ForegroundColor White
Write-Host "   - Updated all booking fetch functions" -ForegroundColor White
Write-Host "   - Improved error handling" -ForegroundColor White

Write-Host "`n3. frontend/src/pages/admin/BookingManagement.tsx:" -ForegroundColor Cyan
Write-Host "   - Added detailed console logging for debugging" -ForegroundColor White
Write-Host "   - Updated fetchBookings function" -ForegroundColor White
Write-Host "   - Improved error handling" -ForegroundColor White

Write-Host "`n🚀 Testing Steps:" -ForegroundColor Blue

Write-Host "`n1. Start Backend:" -ForegroundColor Cyan
Write-Host "   - Run: mvn spring-boot:run" -ForegroundColor White
Write-Host "   - Check: http://localhost:8080/api/booking" -ForegroundColor White

Write-Host "`n2. Start Frontend:" -ForegroundColor Cyan
Write-Host "   - Run: npm run dev" -ForegroundColor White
Write-Host "   - Check: http://localhost:5173/profile" -ForegroundColor White

Write-Host "`n3. Test Booking Flow:" -ForegroundColor Cyan
Write-Host "   - Go to booking page" -ForegroundColor White
Write-Host "   - Select seats and proceed to payment" -ForegroundColor White
Write-Host "   - Complete payment (or use test callback)" -ForegroundColor White
Write-Host "   - Check profile page for booking history" -ForegroundColor White

Write-Host "`n4. Test Admin Panel:" -ForegroundColor Cyan
Write-Host "   - Go to admin booking management" -ForegroundColor White
Write-Host "   - Check if bookings are displayed" -ForegroundColor White
Write-Host "   - Test booking details modal" -ForegroundColor White

Write-Host "`n🔧 Debug Commands:" -ForegroundColor Blue

Write-Host "`n1. Test API directly:" -ForegroundColor Cyan
Write-Host "curl -X GET http://localhost:8080/api/booking" -ForegroundColor White

Write-Host "`n2. Test payment callback:" -ForegroundColor Cyan
Write-Host "curl -X GET 'http://localhost:8080/api/vnpay/test-simple'" -ForegroundColor White

Write-Host "`n3. Check database:" -ForegroundColor Cyan
Write-Host "SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;" -ForegroundColor White

Write-Host "`n📋 Expected Results:" -ForegroundColor Blue
Write-Host "✅ Booking history should display in user profile" -ForegroundColor Green
Write-Host "✅ Booking history should display in admin panel" -ForegroundColor Green
Write-Host "✅ Booking details should show movie, showtime, seats" -ForegroundColor Green
Write-Host "✅ Console should show detailed API response logs" -ForegroundColor Green

Write-Host "`n❌ If Issues Persist:" -ForegroundColor Red
Write-Host "1. Check browser console for errors" -ForegroundColor Cyan
Write-Host "2. Check backend logs for booking creation" -ForegroundColor Cyan
Write-Host "3. Verify database has booking records" -ForegroundColor Cyan
Write-Host "4. Test API endpoints manually" -ForegroundColor Cyan

Write-Host "`n🏁 Fix summary completed!" -ForegroundColor Green
Write-Host "The booking history display issue should now be resolved." -ForegroundColor Green
