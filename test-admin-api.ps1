# Script test API quản lý đặt vé
Write-Host "🧪 Testing Admin Bookings API..." -ForegroundColor Green

# Test 1: Kiểm tra endpoint có tồn tại không
Write-Host "`n1. Testing endpoint availability..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings" -Method GET -Headers @{"Authorization" = "Bearer test-token"}
    Write-Host "✅ Endpoint accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Kiểm tra response structure
Write-Host "`n2. Testing response structure..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings" -Method GET -Headers @{"Authorization" = "Bearer test-token"}
    Write-Host "Response status: $($response.status)" -ForegroundColor Cyan
    Write-Host "Response message: $($response.message)" -ForegroundColor Cyan
    Write-Host "Response data type: $($response.object.GetType().Name)" -ForegroundColor Cyan
    if ($response.object -is [array]) {
        Write-Host "Response array length: $($response.object.Length)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Structure test error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test completed!" -ForegroundColor Green
