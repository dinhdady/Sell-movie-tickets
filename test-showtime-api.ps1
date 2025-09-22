# Script để test showtime API
Write-Host "🔍 Testing showtime API..." -ForegroundColor Yellow

# Test 1: Lấy tất cả showtimes (không cần auth)
Write-Host "`n🔍 Test 1: Getting all showtimes..." -ForegroundColor Blue
try {
    $showtimesResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method GET
    Write-Host "✅ All showtimes:" -ForegroundColor Green
    Write-Host ($showtimesResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Lấy showtime ID 6 cụ thể
Write-Host "`n🔍 Test 2: Getting showtime ID 6..." -ForegroundColor Blue
try {
    $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method GET
    Write-Host "✅ Showtime 6:" -ForegroundColor Green
    Write-Host ($showtimeResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Showtime 6 not found: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Lấy showtimes theo movie ID 7
Write-Host "`n🔍 Test 3: Getting showtimes for movie ID 7..." -ForegroundColor Blue
try {
    $movieShowtimesResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/7" -Method GET
    Write-Host "✅ Showtimes for movie 7:" -ForegroundColor Green
    Write-Host ($movieShowtimesResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get movie showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Lấy showtimes theo room ID 1
Write-Host "`n🔍 Test 4: Getting showtimes for room ID 1..." -ForegroundColor Blue
try {
    $roomShowtimesResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/room/1" -Method GET
    Write-Host "✅ Showtimes for room 1:" -ForegroundColor Green
    Write-Host ($roomShowtimesResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get room showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Showtime API test completed" -ForegroundColor Green