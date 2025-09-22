# Test API sau khi sửa lỗi
Write-Host "🧪 Testing API after fix..." -ForegroundColor Yellow

try {
    # Login
    $loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.object.accessToken
    $user = $loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)" -ForegroundColor Cyan

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Test 1: Kiểm tra showtime ID 6
    Write-Host "
🔍 Test 1: Checking showtime ID 6..." -ForegroundColor Blue
    try {
        $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method Get -Headers $headers
        Write-Host "✅ Showtime ID 6 found:" -ForegroundColor Green
        Write-Host "   Movie ID: $($showtimeResponse.object.movie_id)" -ForegroundColor Cyan
        Write-Host "   Room ID: $($showtimeResponse.object.room_id)" -ForegroundColor Cyan
        Write-Host "   Status: $($showtimeResponse.object.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Showtime ID 6 not found: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test 2: Tạo order mới
    Write-Host "
🔍 Test 2: Creating new order..." -ForegroundColor Blue
    try {
        $orderData = @{
            userId = $user.id
            showtimeId = 6
            totalPrice = 360000
            customerEmail = "test@example.com"
            customerName = "Test User"
            customerPhone = "0123456789"
            customerAddress = "Test Address"
        } | ConvertTo-Json

        $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body $orderData -Headers $headers
        Write-Host "✅ Order created successfully!" -ForegroundColor Green
        Write-Host "   Order ID: $($orderResponse.object.id)" -ForegroundColor Cyan
        Write-Host "   TxnRef: $($orderResponse.object.txnRef)" -ForegroundColor Cyan

        # Test 3: Tạo booking với order mới
        Write-Host "
🔍 Test 3: Creating booking..." -ForegroundColor Blue
        $bookingData = @{
            userId = $user.id
            showtimeId = 6
            orderId = $orderResponse.object.id
            totalPrice = 360000
            customerName = "Test User"
            customerEmail = "test@example.com"
            customerPhone = "0123456789"
            customerAddress = "Test Address"
            seatIds = @(1, 2)
        } | ConvertTo-Json

        $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body $bookingData -Headers $headers
        Write-Host "✅ Booking created successfully!" -ForegroundColor Green
        Write-Host "   Booking ID: $($bookingResponse.object.id)" -ForegroundColor Cyan

    } catch {
        Write-Host "❌ Order/Booking creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Error details: $errorBody" -ForegroundColor Red
            } catch {
                Write-Host "Could not read error details" -ForegroundColor Red
            }
        }
    }

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
