# Script để test booking sau khi tạo showtime ID 6
Write-Host "🧪 Testing booking after creating showtime ID 6..." -ForegroundColor Yellow

# 1. Login để lấy token
Write-Host "`n🔍 Step 1: Logging in..." -ForegroundColor Blue

try {
    $loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.object.accessToken
    $user = $loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)" -ForegroundColor Cyan
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan

} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Test showtime API
Write-Host "`n🔍 Step 2: Testing showtime API..." -ForegroundColor Blue

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get -Headers $headers
    Write-Host "✅ Showtimes retrieved successfully!" -ForegroundColor Green
    
    # Tìm showtime ID 6
    $showtime6 = $showtimeResponse | Where-Object { $_.id -eq 6 }
    if ($showtime6) {
        Write-Host "✅ Found showtime ID 6:" -ForegroundColor Green
        Write-Host "   Movie ID: $($showtime6.movie_id)" -ForegroundColor Cyan
        Write-Host "   Room ID: $($showtime6.room_id)" -ForegroundColor Cyan
        Write-Host "   Start Time: $($showtime6.start_time)" -ForegroundColor Cyan
        Write-Host "   End Time: $($showtime6.end_time)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Showtime ID 6 still not found!" -ForegroundColor Red
        Write-Host "Available showtime IDs:" -ForegroundColor Yellow
        $showtimeResponse | ForEach-Object { Write-Host "  - ID: $($_.id)" -ForegroundColor Cyan }
    }

} catch {
    Write-Host "❌ Failed to get showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test order creation với showtime ID 6
Write-Host "`n🔍 Step 3: Testing order creation with showtime ID 6..." -ForegroundColor Blue

try {
    $orderData = @{
        userId = $user.id
        showtimeId = 6
        totalPrice = 120000
        customerEmail = "test@example.com"
        customerName = "Test User"
        customerPhone = "0123456789"
        customerAddress = "Test Address"
    } | ConvertTo-Json

    Write-Host "Order data: $orderData" -ForegroundColor Cyan

    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body $orderData -Headers $headers
    Write-Host "✅ Order creation successful!" -ForegroundColor Green
    Write-Host "   Order ID: $($orderResponse.object.id)" -ForegroundColor Cyan
    Write-Host "   TxnRef: $($orderResponse.object.txnRef)" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Order creation failed: $($_.Exception.Message)" -ForegroundColor Red
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

# 4. Test booking creation
Write-Host "`n🔍 Step 4: Testing booking creation..." -ForegroundColor Blue

try {
    $bookingData = @{
        userId = $user.id
        showtimeId = 6
        orderId = 1  # Giả sử order ID 1 tồn tại
        totalPrice = 120000
        customerName = "Test User"
        customerEmail = "test@example.com"
        customerPhone = "0123456789"
        customerAddress = "Test Address"
        seatIds = @(1, 2)  # Giả sử seat ID 1, 2 tồn tại
    } | ConvertTo-Json

    Write-Host "Booking data: $bookingData" -ForegroundColor Cyan

    $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body $bookingData -Headers $headers
    Write-Host "✅ Booking creation successful!" -ForegroundColor Green
    Write-Host "   Booking ID: $($bookingResponse.object.id)" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Booking creation failed: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "`n🏁 Test completed!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Yellow
Write-Host "1. If showtime ID 6 is found, the database fix worked" -ForegroundColor Cyan
Write-Host "2. If order creation works, the showtime is valid" -ForegroundColor Cyan
Write-Host "3. If booking creation works, the full flow is working" -ForegroundColor Cyan
