# Script test booking flow
Write-Host "🧪 Testing booking flow..." -ForegroundColor Yellow

Write-Host "`n🔍 Testing Steps:" -ForegroundColor Blue
Write-Host "1. Start backend server" -ForegroundColor Cyan
Write-Host "2. Start frontend server" -ForegroundColor Cyan
Write-Host "3. Test booking creation" -ForegroundColor Cyan
Write-Host "4. Test payment callback" -ForegroundColor Cyan
Write-Host "5. Check booking history display" -ForegroundColor Cyan

Write-Host "`n🚀 Backend API Endpoints to Test:" -ForegroundColor Blue
Write-Host "GET /api/booking - Get all bookings" -ForegroundColor Cyan
Write-Host "GET /api/booking/{id}/details - Get booking details" -ForegroundColor Cyan
Write-Host "POST /api/booking - Create booking" -ForegroundColor Cyan
Write-Host "GET /api/vnpay/return - Payment callback" -ForegroundColor Cyan

Write-Host "`n🎯 Frontend Pages to Test:" -ForegroundColor Blue
Write-Host "http://localhost:5173/profile - User profile with booking history" -ForegroundColor Cyan
Write-Host "http://localhost:5173/admin/booking-management - Admin booking management" -ForegroundColor Cyan
Write-Host "http://localhost:5173/booking/7 - Booking page" -ForegroundColor Cyan

Write-Host "`n🔧 Debug Commands:" -ForegroundColor Blue
Write-Host "1. Check backend logs for booking creation" -ForegroundColor Cyan
Write-Host "2. Check frontend console for API responses" -ForegroundColor Cyan
Write-Host "3. Check database for booking records" -ForegroundColor Cyan
Write-Host "4. Test payment callback manually" -ForegroundColor Cyan

Write-Host "`n📋 Expected Results:" -ForegroundColor Blue
Write-Host "✅ Booking should be created during payment process" -ForegroundColor Green
Write-Host "✅ Booking should appear in user profile" -ForegroundColor Green
Write-Host "✅ Booking should appear in admin panel" -ForegroundColor Green
Write-Host "✅ Booking details should show movie, showtime, seats" -ForegroundColor Green

Write-Host "`n❌ Common Issues:" -ForegroundColor Red
Write-Host "1. Booking not created during payment" -ForegroundColor Cyan
Write-Host "2. API response type mismatch" -ForegroundColor Cyan
Write-Host "3. Database relationship issues" -ForegroundColor Cyan
Write-Host "4. Frontend not handling response correctly" -ForegroundColor Cyan

Write-Host "`n🏁 Test script completed!" -ForegroundColor Green
Write-Host "Run the test steps to verify booking flow works correctly." -ForegroundColor Green
