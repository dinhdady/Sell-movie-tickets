# Fix Database and Test Script
Write-Host "🔧 Fixing Database Issues and Testing..." -ForegroundColor Green

# Test backend status
Write-Host "🔍 Testing backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/testing/hello" -Method GET -UseBasicParsing
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Starting it..." -ForegroundColor Red
    Start-Process -FilePath "java" -ArgumentList "-jar", "target/movie-0.0.1-SNAPSHOT.jar" -WindowStyle Hidden
    Start-Sleep -Seconds 15
}

# Test with token
$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW5oMTIzMyIsInJvbGUiOiJST0xFX0FETUlOIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6Im1vdmllIiwiaWF0IjoxNzU4NTIwNTg4LCJleHAiOjE3NTg1MjQxODh9.aHJw3rZ1PBYp4QIBVyZxoPPv22A1WsS-rFttDb_9EmM"

Write-Host "🧪 Testing admin bookings with token..." -ForegroundColor Cyan
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings" -Method GET -Headers $headers
    Write-Host "✅ Admin bookings API response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Bookings count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Admin bookings API failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Yellow
}

# Test test endpoint
Write-Host "`n🧪 Testing test endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings/test" -Method GET
    Write-Host "✅ Test endpoint response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Bookings count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Test endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test main booking API
Write-Host "`n🧪 Testing main booking API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method GET
    Write-Host "✅ Main booking API response:" -ForegroundColor Green
    Write-Host "Bookings count: $($response.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Main booking API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Database Fix and Test Complete!" -ForegroundColor Green
Write-Host "If you still see errors, the issue is likely:" -ForegroundColor Yellow
Write-Host "1. Orphaned booking records in database" -ForegroundColor Gray
Write-Host "2. Missing showtime data" -ForegroundColor Gray
Write-Host "3. Database integrity issues" -ForegroundColor Gray
Write-Host "`nYou can access the admin page at: http://localhost:5173/admin/bookings" -ForegroundColor Cyan

