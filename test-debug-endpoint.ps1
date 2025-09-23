Write-Host "=== TESTING DEBUG ENDPOINT ==="

Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 35

Write-Host "=== TESTING DEBUG ENDPOINT ==="
Write-Host "Current Date/Time: $(Get-Date)"
Write-Host ""

Write-Host "1. Testing debug endpoint to see all showtimes:"
Write-Host "curl http://localhost:8080/api/showtime/debug/all"
Write-Host ""

Write-Host "2. Testing filtered movie showtimes:"
Write-Host "curl http://localhost:8080/api/movie/1/showtimes"
Write-Host ""

Write-Host "3. Testing filtered showtime by movie:"
Write-Host "curl http://localhost:8080/api/showtime/movie/1"
Write-Host ""

Write-Host "=== EXPECTED DEBUG OUTPUT ==="
Write-Host "Debug endpoint should show:"
Write-Host "- currentTime: [server time]"
Write-Host "- timezone: [server timezone]"
Write-Host "- totalShowtimes: [number]"
Write-Host "- showtimes: [array with isExpired flags]"
Write-Host ""

Write-Host "=== CHECKING FILTERING ==="
Write-Host "Compare debug endpoint (all showtimes) vs filtered endpoints"
Write-Host "Filtered endpoints should only return showtimes with isExpired: false"
Write-Host ""

Write-Host "=== MANUAL TESTING ==="
Write-Host "1. Open browser to http://localhost:8080/api/showtime/debug/all"
Write-Host "2. Check which showtimes have isExpired: true"
Write-Host "3. Test filtered endpoints to see if they exclude expired ones"
Write-Host "4. Check backend console for debug logging"
Write-Host ""

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
