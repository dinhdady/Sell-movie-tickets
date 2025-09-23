Write-Host "=== TESTING EXPIRED SEATS RELEASE ==="

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
Write-Host "Frontend: http://localhost:5175"

Write-Host ""
Write-Host "=== EXPIRED SEATS RELEASE FEATURE ==="
Write-Host "This feature automatically releases seats when showtime ends:"
Write-Host "1. Scheduled task runs every 5 minutes"
Write-Host "2. Finds all showtimes with endTime < now"
Write-Host "3. Releases all BOOKED/RESERVED seats to AVAILABLE"
Write-Host "4. Logs all seat releases"
Write-Host ""
Write-Host "=== SCHEDULED TASKS ==="
Write-Host "1. Release expired seats: Every 5 minutes"
Write-Host "2. Auto timeout payments: Every 2 minutes"
Write-Host ""
Write-Host "=== TEST ENDPOINTS ==="
Write-Host "Manual release expired seats: POST http://localhost:8080/api/booking/release-expired-seats"
Write-Host ""
Write-Host "=== EXPECTED LOG OUTPUT ==="
Write-Host "[ScheduledTask] Starting scheduled task: releaseSeatsForExpiredShowtimes"
Write-Host "[BookingService] Starting release seats for expired showtimes"
Write-Host "[BookingService] Released seat A1 for expired showtime 123"
Write-Host "[BookingService] Released seat A2 for expired showtime 123"
Write-Host "[BookingService] Released 2 seats for expired showtime ID: 123"
Write-Host "[BookingService] Seat release completed. Processed 1 expired showtimes"
Write-Host "[ScheduledTask] Completed scheduled task: releaseSeatsForExpiredShowtimes"
Write-Host ""
Write-Host "=== TESTING STEPS ==="
Write-Host "1. Create a showtime with endTime in the past"
Write-Host "2. Book some seats for that showtime"
Write-Host "3. Wait for scheduled task to run (or call manual endpoint)"
Write-Host "4. Check that seats are now AVAILABLE"
Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
