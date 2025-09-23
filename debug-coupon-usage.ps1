Write-Host "=== DEBUGGING COUPON USAGE ==="

Write-Host "1. Starting backend..."
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"cd .. ; mvn spring-boot:run`"" -NoNewWindow
Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 30

Write-Host "2. Starting frontend..."
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"npm run dev`"" -WorkingDirectory "frontend" -NoNewWindow
Write-Host "Waiting for frontend to start..."
Start-Sleep -Seconds 15

Write-Host "=== APPLICATION STARTED ==="
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5174"

Write-Host ""
Write-Host "=== DEBUGGING STEPS ==="
Write-Host "1. Login as user: http://localhost:5174/login"
Write-Host "2. Go to movies and select a movie"
Write-Host "3. Choose seats and proceed to booking"
Write-Host "4. Enter coupon code: WELCOME10"
Write-Host "5. Complete payment via VNPay"
Write-Host "6. Check backend logs for detailed coupon usage tracking"
Write-Host ""
Write-Host "=== EXPECTED LOG OUTPUT ==="
Write-Host "[VNPAY] Calling confirmPaymentAndGenerateTickets for txnRef: XXX"
Write-Host "[BookingService] confirmPaymentAndGenerateTickets called with txnRef: XXX"
Write-Host "[BookingService] Found booking ID: XXX with coupon code: WELCOME10"
Write-Host "[BookingService] Applying coupon discount for booking ID: XXX with coupon: WELCOME10"
Write-Host "[CouponService] Before using coupon - Code: WELCOME10, Used: X, Remaining: Y"
Write-Host "[Coupon] useCoupon() - Code: WELCOME10, Used: X -> X+1, Remaining: Y -> Y-1"
Write-Host "[CouponService] After using coupon - Code: WELCOME10, Used: X+1, Remaining: Y-1, Status: ACTIVE"
Write-Host ""
Write-Host "=== TEST ENDPOINTS ==="
Write-Host "Test coupon usage: POST http://localhost:8080/api/booking/test-coupon/{bookingId}"
Write-Host "Check coupon status: GET http://localhost:8080/api/coupon/test-usage/WELCOME10"
Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
