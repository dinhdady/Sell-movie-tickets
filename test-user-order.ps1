# Script để test tạo order với user đã đăng nhập
Write-Host "🧪 Testing order creation with logged-in user..." -ForegroundColor Yellow

# Đăng nhập với user
Write-Host "`n🔍 Login with user..." -ForegroundColor Blue
$loginData = @{
    username = "testuser487"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ User login successful!" -ForegroundColor Green
    $token = $loginResponse.object.accessToken
    $userId = $loginResponse.object.user.id
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host "User ID: $userId" -ForegroundColor Cyan
} catch {
    Write-Host "❌ User login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test tạo order
Write-Host "`n🔍 Creating order..." -ForegroundColor Blue

$orderData = @{
    userId = $userId
    showtimeId = 6
    totalPrice = 180000
    customerEmail = "testuser487@example.com"
    customerName = "Test User"
    customerPhone = "0123456789"
    customerAddress = "123 Test Street"
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

Write-Host "`n🏁 User order test completed" -ForegroundColor Green
