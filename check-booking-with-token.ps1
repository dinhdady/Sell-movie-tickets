# Script để kiểm tra booking với token
Write-Host "🔍 Checking booking with token..." -ForegroundColor Yellow

# Đăng nhập để lấy token
Write-Host "`n🔍 Login to get token..." -ForegroundColor Blue
$loginData = @{
    username = "user1"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.object.accessToken
    Write-Host "Token: $token" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Kiểm tra order 299
Write-Host "`n🔍 Checking Order 299..." -ForegroundColor Blue
try {
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order/299" -Method GET -Headers $headers
    Write-Host "✅ Order 299 details:" -ForegroundColor Green
    Write-Host ($orderResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Order 299 error: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra booking mới nhất
Write-Host "`n🔍 Checking latest bookings..." -ForegroundColor Blue
try {
    $bookingsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method GET -Headers $headers
    Write-Host "✅ Latest bookings:" -ForegroundColor Green
    Write-Host ($bookingsResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Bookings error: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra showtime 6
Write-Host "`n🔍 Checking Showtime 6..." -ForegroundColor Blue
try {
    $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method GET -Headers $headers
    Write-Host "✅ Showtime 6 details:" -ForegroundColor Green
    Write-Host ($showtimeResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Showtime 6 error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Booking check with token completed" -ForegroundColor Green
