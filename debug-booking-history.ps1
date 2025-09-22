# Script debug booking history issue
Write-Host "🔍 Debugging booking history issue..." -ForegroundColor Yellow

Write-Host "`n📋 Current Issues Identified:" -ForegroundColor Red
Write-Host "1. Booking creation flow may not be working properly" -ForegroundColor Cyan
Write-Host "2. Payment callback may not be creating booking records" -ForegroundColor Cyan
Write-Host "3. Frontend may not be fetching booking data correctly" -ForegroundColor Cyan
Write-Host "4. Database relationships may be missing" -ForegroundColor Cyan

Write-Host "`n🔍 Analysis of Booking Flow:" -ForegroundColor Blue
Write-Host "✅ Frontend Profile.tsx:" -ForegroundColor Green
Write-Host "   - Fetches bookings using bookingAPI.getAll()" -ForegroundColor Cyan
Write-Host "   - Filters by customerEmail === authUser?.email" -ForegroundColor Cyan
Write-Host "   - Has auto-refresh on page visibility change" -ForegroundColor Cyan

Write-Host "`n✅ Frontend Admin BookingManagement.tsx:" -ForegroundColor Green
Write-Host "   - Fetches all bookings using bookingAPI.getAll()" -ForegroundColor Cyan
Write-Host "   - Shows detailed booking information" -ForegroundColor Cyan
Write-Host "   - Has booking detail modal" -ForegroundColor Cyan

Write-Host "`n✅ Backend VNPayService:" -ForegroundColor Green
Write-Host "   - handlePaymentReturn() processes payment callback" -ForegroundColor Cyan
Write-Host "   - Calls bookingService.confirmPaymentAndGenerateTickets()" -ForegroundColor Cyan
Write-Host "   - Updates order status to PAID" -ForegroundColor Cyan

Write-Host "`n✅ Backend BookingService:" -ForegroundColor Green
Write-Host "   - confirmPaymentAndGenerateTickets() creates tickets" -ForegroundColor Cyan
Write-Host "   - Updates booking status to CONFIRMED then PAID" -ForegroundColor Cyan
Write-Host "   - Generates QR codes for tickets" -ForegroundColor Cyan

Write-Host "`n❌ Potential Issues:" -ForegroundColor Red
Write-Host "1. Booking may not be created during payment process" -ForegroundColor Cyan
Write-Host "2. Order-Booking relationship may be missing" -ForegroundColor Cyan
Write-Host "3. Frontend may not be calling correct API endpoints" -ForegroundColor Cyan
Write-Host "4. Database may not have proper foreign key relationships" -ForegroundColor Cyan

Write-Host "`n🔧 Debug Steps:" -ForegroundColor Blue
Write-Host "1. Check if booking is created during payment" -ForegroundColor Cyan
Write-Host "2. Verify Order-Booking relationship" -ForegroundColor Cyan
Write-Host "3. Test booking API endpoints" -ForegroundColor Cyan
Write-Host "4. Check database for booking records" -ForegroundColor Cyan
Write-Host "5. Verify frontend API calls" -ForegroundColor Cyan

Write-Host "`n🚀 Next Steps:" -ForegroundColor Blue
Write-Host "1. Test booking creation flow" -ForegroundColor Cyan
Write-Host "2. Check database records" -ForegroundColor Cyan
Write-Host "3. Verify API responses" -ForegroundColor Cyan
Write-Host "4. Fix any missing relationships" -ForegroundColor Cyan

Write-Host "`n🏁 Debug analysis completed!" -ForegroundColor Green
Write-Host "The issue is likely in the booking creation or data retrieval process." -ForegroundColor Green
