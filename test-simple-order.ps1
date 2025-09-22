# Test đơn giản Order API
Write-Host "🧪 Testing Order API..." -ForegroundColor Yellow

# Test với dữ liệu đơn giản
$orderData = @{
    userId = "user1"
    showtimeId = 1
    totalPrice = 150000
    customerEmail = "test@example.com"
    customerName = "Test User"
    customerPhone = "0123456789"
    customerAddress = "123 Test Street"
} | ConvertTo-Json

Write-Host "Order data: $orderData" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $orderData -ContentType "application/json"
    Write-Host "✅ Order API response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Order API error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Test completed" -ForegroundColor Green
