# Script để test với user mới
Write-Host "🧪 Testing with new user..." -ForegroundColor Yellow

# Tạo user mới
Write-Host "`n🔍 Creating new user..." -ForegroundColor Blue
$registerData = @{
    username = "newuser$(Get-Random -Maximum 1000)"
    email = "newuser$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "New User"
    phone = "0123456789"
} | ConvertTo-Json

Write-Host "Register data: $registerData" -ForegroundColor Cyan

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
    
    if ($registerResponse.object.verificationRequired) {
        Write-Host "⚠️ Email verification required, trying to login anyway..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Thử đăng nhập (có thể cần verify email trước)
Write-Host "`n🔍 Trying to login..." -ForegroundColor Blue
$loginData = @{
    username = ($registerData | ConvertFrom-Json).username
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Full response: $($loginResponse | ConvertTo-Json -Depth 5)" -ForegroundColor White
    
    $token = $loginResponse.object.accessToken
    $userId = $loginResponse.object.user.id
    
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host "User ID: $userId" -ForegroundColor Cyan
    
    # Test tạo order
    Write-Host "`n🔍 Creating order..." -ForegroundColor Blue
    
    $orderData = @{
        userId = $userId
        showtimeId = 6
        totalPrice = 180000
        customerEmail = "newuser@example.com"
        customerName = "New User"
        customerPhone = "0123456789"
        customerAddress = "123 New Street"
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
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "User may need email verification" -ForegroundColor Yellow
}

Write-Host "`n🏁 New user test completed" -ForegroundColor Green
