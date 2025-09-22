# Script để test Order API sau khi fix
Write-Host "🧪 Testing Order API after fix..." -ForegroundColor Yellow

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

# Test 2: Test Order API với dữ liệu đúng
Write-Host "`n🔍 Test 2: Testing Order API with correct data..." -ForegroundColor Blue

$orderData = @{
    userId = $userId
    showtimeId = 1
    totalPrice = 150000
    customerEmail = "user1@example.com"
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

# Test 3: Test với dữ liệu từ BookingForm
Write-Host "`n🔍 Test 3: Testing with BookingForm data..." -ForegroundColor Blue

$bookingFormData = @{
    userId = $userId
    showtimeId = 1
    totalPrice = 200000
    customerEmail = "user1@example.com"
    customerName = "User One"
    customerPhone = "0123456789"
    customerAddress = "456 Main Street"
} | ConvertTo-Json

Write-Host "BookingForm data: $bookingFormData" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $bookingFormData -Headers $headers
    Write-Host "✅ BookingForm Order API response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ BookingForm Order API error: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "`n🔍 Debug steps:" -ForegroundColor Blue
Write-Host "1. Check backend logs for detailed error messages" -ForegroundColor White
Write-Host "2. Verify OrderDTO fields are properly deserialized" -ForegroundColor White
Write-Host "3. Check if user exists in database" -ForegroundColor White
Write-Host "4. Check OrderService.createOrder method" -ForegroundColor White

Write-Host "`n🏁 Order API test after fix completed" -ForegroundColor Green
