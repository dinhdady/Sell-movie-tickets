# Script test API với token thực
Write-Host "🧪 Testing Admin Bookings API with real token..." -ForegroundColor Green

# Lấy token từ localStorage (cần mở browser console)
Write-Host "`n1. Please open browser console and run:" -ForegroundColor Yellow
Write-Host "   localStorage.getItem('token')" -ForegroundColor Cyan
Write-Host "   Copy the token and paste it here:" -ForegroundColor Cyan

$token = Read-Host "Enter your JWT token"

if ($token -and $token -ne "") {
    Write-Host "`n2. Testing with real token..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings" -Method GET -Headers $headers
        Write-Host "✅ API call successful!" -ForegroundColor Green
        Write-Host "Response status: $($response.status)" -ForegroundColor Cyan
        Write-Host "Response message: $($response.message)" -ForegroundColor Cyan
        Write-Host "Response data type: $($response.object.GetType().Name)" -ForegroundColor Cyan
        if ($response.object -is [array]) {
            Write-Host "Response array length: $($response.object.Length)" -ForegroundColor Cyan
            if ($response.object.Length -gt 0) {
                Write-Host "First booking: $($response.object[0] | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
            }
        }
    } catch {
        Write-Host "❌ API call failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No token provided" -ForegroundColor Red
}

Write-Host "`n🎯 Test completed!" -ForegroundColor Green