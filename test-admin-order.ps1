# Script để test với admin user
Write-Host "🧪 Testing with admin user..." -ForegroundColor Yellow

# Đăng nhập với admin
Write-Host "`n🔍 Login with admin..." -ForegroundColor Blue
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    $token = $loginResponse.object.accessToken
    $userId = $loginResponse.object.user.id
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host "User ID: $userId" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test tạo order
Write-Host "`n🔍 Creating order..." -ForegroundColor Blue

$orderData = @{
    userId = $userId
    showtimeId = 6
    totalPrice = 180000
    customerEmail = "admin@example.com"
    customerName = "Admin User"
    customerPhone = "0123456789"
    customerAddress = "123 Admin Street"
} | ConvertTo-Json

Write-Host "Order data: $orderData" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $orderData -Headers $headers
    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "Order response: $($orderResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Order creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Admin order test completed" -ForegroundColor Green
