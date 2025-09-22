# Script test với authentication
Write-Host "🧪 Testing with authentication..." -ForegroundColor Yellow

try {
    # 1. Login để lấy token
    Write-Host "`n🔍 Step 1: Logging in..." -ForegroundColor Blue
    $loginData = @{
        username = "user1"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.object.accessToken
    $user = $loginResponse.object.user
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)" -ForegroundColor Cyan
    Write-Host "   Username: $($user.username)" -ForegroundColor Cyan

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # 2. Test showtime API
    Write-Host "`n🔍 Step 2: Testing showtime API..." -ForegroundColor Blue
    try {
        $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method Get -Headers $headers
        Write-Host "✅ Showtimes retrieved successfully!" -ForegroundColor Green
        Write-Host "   Found $($showtimeResponse.Count) showtimes" -ForegroundColor Cyan
        
        # Tìm showtime ID 6
        $showtime6 = $showtimeResponse | Where-Object { $_.id -eq 6 }
        if ($showtime6) {
            Write-Host "✅ Found showtime ID 6:" -ForegroundColor Green
            Write-Host "   Movie ID: $($showtime6.movie_id)" -ForegroundColor Cyan
            Write-Host "   Room ID: $($showtime6.room_id)" -ForegroundColor Cyan
            Write-Host "   Status: $($showtime6.status)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Showtime ID 6 not found!" -ForegroundColor Red
            Write-Host "Available showtime IDs:" -ForegroundColor Yellow
            $showtimeResponse | ForEach-Object { Write-Host "  - ID: $($_.id)" -ForegroundColor Cyan }
            
            Write-Host "`n🔧 Creating showtime ID 6..." -ForegroundColor Yellow
            Write-Host "Please run: mysql -u root -p < complete_db_fix.sql" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "❌ Failed to get showtimes: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 3. Test order creation
    Write-Host "`n🔍 Step 3: Testing order creation..." -ForegroundColor Blue
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

        Write-Host "Order data: $orderData" -ForegroundColor Cyan

        $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method Post -Body $orderData -Headers $headers
        Write-Host "✅ Order created successfully!" -ForegroundColor Green
        Write-Host "   Order ID: $($orderResponse.object.id)" -ForegroundColor Cyan
        Write-Host "   TxnRef: $($orderResponse.object.txnRef)" -ForegroundColor Cyan

        # 4. Test booking creation
        Write-Host "`n🔍 Step 4: Testing booking creation..." -ForegroundColor Blue
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

        Write-Host "Booking data: $bookingData" -ForegroundColor Cyan

        $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body $bookingData -Headers $headers
        Write-Host "✅ Booking created successfully!" -ForegroundColor Green
        Write-Host "   Booking ID: $($bookingResponse.object.id)" -ForegroundColor Cyan

        Write-Host "`n🎉 All tests passed! The 400 error is fixed!" -ForegroundColor Green

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
    Write-Host "Please check if backend is running and user credentials are correct" -ForegroundColor Yellow
}

Write-Host "`n🏁 Test completed!" -ForegroundColor Green
