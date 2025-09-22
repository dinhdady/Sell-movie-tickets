# Script để test Order API với JWT token
Write-Host "🧪 Testing Order API with JWT token..." -ForegroundColor Yellow

# Test 1: Đăng nhập để lấy token
Write-Host "`n🔍 Test 1: Login to get JWT token..." -ForegroundColor Blue

$loginData = @{
    username = "user1"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.object.accessToken)" -ForegroundColor Cyan
    
    $token = $loginResponse.object.accessToken
    $userId = $loginResponse.object.user.id
    
    Write-Host "User ID: $userId" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test Order API với token
Write-Host "`n🔍 Test 2: Testing Order API with token..." -ForegroundColor Blue

$orderData = @{
    userId = $userId
    totalPrice = 150000
    customerEmail = "user1@example.com"
} | ConvertTo-Json

Write-Host "Order data: $orderData" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $orderData -Headers $headers
    Write-Host "✅ Order API response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Order API error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error body: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error body" -ForegroundColor Red
        }
    }
}

# Test 3: Test với dữ liệu không hợp lệ
Write-Host "`n🔍 Test 3: Testing with invalid data..." -ForegroundColor Blue

$invalidOrderData = @{
    userId = "invalid-user-id"
    totalPrice = -100
    customerEmail = "invalid-email"
} | ConvertTo-Json

Write-Host "Invalid data: $invalidOrderData" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $invalidOrderData -Headers $headers
    Write-Host "✅ Invalid Order API response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Invalid Order API error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Debug steps:" -ForegroundColor Blue
Write-Host "1. Check if JWT token is valid" -ForegroundColor White
Write-Host "2. Check if user exists in database" -ForegroundColor White
Write-Host "3. Check Order model compilation" -ForegroundColor White
Write-Host "4. Check OrderService.createOrder method" -ForegroundColor White
Write-Host "5. Check backend logs for detailed error" -ForegroundColor White

Write-Host "`n🏁 Order API test with token completed" -ForegroundColor Green
