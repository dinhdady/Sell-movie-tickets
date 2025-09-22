# Test script for status fix
Write-Host "🎬 Testing Status Fix" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

Write-Host "`nFixed Issues:" -ForegroundColor Green
Write-Host "✅ Changed from MyTicketResponse to ApiBooking" -ForegroundColor White
Write-Host "✅ Updated API return type" -ForegroundColor White
Write-Host "✅ Fixed property mapping" -ForegroundColor White
Write-Host "✅ Added debug logging" -ForegroundColor White

Write-Host "`nAPI Structure:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host "Endpoint: GET /api/tickets/my-tickets?userId={userId}" -ForegroundColor White
Write-Host "Returns: BookingDetailsResponse[] (mapped to ApiBooking[])" -ForegroundColor White
Write-Host "Properties:" -ForegroundColor White
Write-Host "• id: Long" -ForegroundColor White
Write-Host "• customerName: String" -ForegroundColor White
Write-Host "• customerEmail: String" -ForegroundColor White
Write-Host "• paymentStatus: String" -ForegroundColor White
Write-Host "• totalPrice: double" -ForegroundColor White
Write-Host "• movie: MovieDTO" -ForegroundColor White
Write-Host "• showtime: ShowtimeDTO" -ForegroundColor White
Write-Host "• order: OrderDTO" -ForegroundColor White

Write-Host "`nMapping Logic:" -ForegroundColor Magenta
Write-Host "==============" -ForegroundColor Magenta
Write-Host "paymentStatus: booking.paymentStatus || booking.status" -ForegroundColor White
Write-Host "status: booking.status" -ForegroundColor White
Write-Host "totalPrice: booking.totalPrice" -ForegroundColor White
Write-Host "movie.title: booking.movie?.title" -ForegroundColor White
Write-Host "showtime.startTime: booking.showtime?.startTime" -ForegroundColor White

Write-Host "`nTesting Steps:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:5173/profile" -ForegroundColor White
Write-Host "2. Login with user account" -ForegroundColor White
Write-Host "3. Check console logs for:" -ForegroundColor White
Write-Host "   🎯 [Profile] My tickets API response: [array]" -ForegroundColor Gray
Write-Host "   🎯 [Profile] Booking status mapping: {id, paymentStatus, status, finalStatus}" -ForegroundColor Gray
Write-Host "4. Verify status values are no longer undefined" -ForegroundColor White

Write-Host "`nExpected Results:" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "✅ paymentStatus: 'PENDING' or 'PAID' or 'USED'" -ForegroundColor White
Write-Host "✅ status: 'PENDING' or 'PAID' or 'USED'" -ForegroundColor White
Write-Host "✅ finalStatus: Same as paymentStatus" -ForegroundColor White
Write-Host "✅ No more undefined values" -ForegroundColor White

Write-Host "`nReady to test!" -ForegroundColor Cyan
