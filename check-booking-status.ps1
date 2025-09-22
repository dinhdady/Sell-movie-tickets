# Script để kiểm tra trạng thái booking
Write-Host "🔍 Checking booking status..." -ForegroundColor Yellow

# Kiểm tra order 299
Write-Host "`n🔍 Checking Order 299..." -ForegroundColor Blue
try {
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order/299" -Method GET
    Write-Host "✅ Order 299 details:" -ForegroundColor Green
    Write-Host ($orderResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Order 299 not found: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra booking mới nhất
Write-Host "`n🔍 Checking latest bookings..." -ForegroundColor Blue
try {
    $bookingsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method GET
    Write-Host "✅ Latest bookings:" -ForegroundColor Green
    Write-Host ($bookingsResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get bookings: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra showtime 6
Write-Host "`n🔍 Checking Showtime 6..." -ForegroundColor Blue
try {
    $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method GET
    Write-Host "✅ Showtime 6 details:" -ForegroundColor Green
    Write-Host ($showtimeResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Showtime 6 not found: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Booking status check completed" -ForegroundColor Green
