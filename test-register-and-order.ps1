# Script để test register user mới và tạo order
Write-Host "🧪 Testing register new user and create order..." -ForegroundColor Yellow

# Test 1: Đăng ký user mới
Write-Host "`n🔍 Test 1: Registering new user..." -ForegroundColor Blue

$registerData = @{
    username = "testuser$(Get-Random -Maximum 1000)"
    email = "testuser$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "Test User"
    phone = "0123456789"
} | ConvertTo-Json

Write-Host "Register data: $registerData" -ForegroundColor Cyan

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
    
    # Nếu cần xác thực email, bỏ qua bước login
    if ($registerResponse.object.verificationRequired) {
        Write-Host "⚠️ Email verification required, skipping login test" -ForegroundColor Yellow
        exit 0
    }
    
    $token = $registerResponse.object.accessToken
    $userId = $registerResponse.object.user.id
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying to login with existing user..." -ForegroundColor Yellow
    
    # Thử đăng nhập với user có sẵn
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ Login successful!" -ForegroundColor Green
        $token = $loginResponse.object.accessToken
        $userId = $loginResponse.object.user.id
    } catch {
        Write-Host "❌ Login also failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Token: $token" -ForegroundColor Cyan
Write-Host "User ID: $userId" -ForegroundColor Cyan

# Test 2: Tạo order
Write-Host "`n🔍 Test 2: Creating order..." -ForegroundColor Blue

$orderData = @{
    userId = $userId
    showtimeId = 6
    totalPrice = 180000
    customerEmail = "test@example.com"
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

Write-Host "`n🏁 Test completed" -ForegroundColor Green
