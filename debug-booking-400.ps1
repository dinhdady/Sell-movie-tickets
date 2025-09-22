# Script debug lỗi 400 khi tạo booking
Write-Host "🔍 Debugging booking 400 error..." -ForegroundColor Yellow

try {
    # 1. Login để lấy token
    Write-Host "`n🔍 Step 1: Logging in..." -ForegroundColor Blue
    $loginData = @{
        username = "testuser"
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

    # 2. Kiểm tra showtime ID 6
    Write-Host "`n🔍 Step 2: Checking showtime ID 6..." -ForegroundColor Blue
    try {
        $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/6" -Method Get -Headers $headers
        Write-Host "✅ Showtime ID 6 found!" -ForegroundColor Green
        Write-Host "   Movie ID: $($showtimeResponse.object.movie_id)" -ForegroundColor Cyan
        Write-Host "   Room ID: $($showtimeResponse.object.room_id)" -ForegroundColor Cyan
        Write-Host "   Status: $($showtimeResponse.object.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Showtime ID 6 not found: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please run: mysql -u root -p < create_test_user.sql" -ForegroundColor Yellow
        exit 1
    }

    # 3. Kiểm tra seats
    Write-Host "`n🔍 Step 3: Checking seats..." -ForegroundColor Blue
    try {
        $seatsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/seat/room/1" -Method Get -Headers $headers
        Write-Host "✅ Seats found!" -ForegroundColor Green
        Write-Host "   Found $($seatsResponse.Count) seats" -ForegroundColor Cyan
        
        $seat1 = $seatsResponse | Where-Object { $_.id -eq 1 }
        $seat2 = $seatsResponse | Where-Object { $_.id -eq 2 }
        
        if ($seat1) {
            Write-Host "✅ Seat ID 1 found: $($seat1.seat_number)" -ForegroundColor Green
        } else {
            Write-Host "❌ Seat ID 1 not found!" -ForegroundColor Red
        }
        
        if ($seat2) {
            Write-Host "✅ Seat ID 2 found: $($seat2.seat_number)" -ForegroundColor Green
        } else {
            Write-Host "❌ Seat ID 2 not found!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Failed to get seats: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 4. Tạo order trước
    Write-Host "`n🔍 Step 4: Creating order..." -ForegroundColor Blue
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

        # 5. Test booking creation với debug chi tiết
        Write-Host "`n🔍 Step 5: Testing booking creation with detailed debug..." -ForegroundColor Blue
        
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

        try {
            $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method Post -Body $bookingData -Headers $headers
            Write-Host "✅ Booking created successfully!" -ForegroundColor Green
            Write-Host "   Booking ID: $($bookingResponse.object.id)" -ForegroundColor Cyan

            Write-Host "`n🎉 All tests passed! The 400 error is fixed!" -ForegroundColor Green

        } catch {
            Write-Host "❌ Booking creation failed: $($_.Exception.Message)" -ForegroundColor Red
            
            # Chi tiết lỗi
            if ($_.Exception.Response) {
                try {
                    $errorStream = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($errorStream)
                    $errorBody = $reader.ReadToEnd()
                    Write-Host "Error details: $errorBody" -ForegroundColor Red
                    
                    # Parse JSON error nếu có
                    try {
                        $errorJson = $errorBody | ConvertFrom-Json
                        Write-Host "Error message: $($errorJson.message)" -ForegroundColor Red
                        Write-Host "Error code: $($errorJson.code)" -ForegroundColor Red
                    } catch {
                        Write-Host "Could not parse error JSON" -ForegroundColor Red
                    }
                } catch {
                    Write-Host "Could not read error details" -ForegroundColor Red
                }
            }
            
            # Gợi ý sửa lỗi
            Write-Host "`n🔧 Possible fixes:" -ForegroundColor Yellow
            Write-Host "1. Check if showtime ID 6 exists in database" -ForegroundColor Cyan
            Write-Host "2. Check if seat IDs 1, 2 exist in database" -ForegroundColor Cyan
            Write-Host "3. Check if order ID exists" -ForegroundColor Cyan
            Write-Host "4. Check if user has permission to book" -ForegroundColor Cyan
            Write-Host "5. Check backend logs for more details" -ForegroundColor Cyan
        }

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

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check if backend is running and user credentials are correct" -ForegroundColor Yellow
}

Write-Host "`n🏁 Debug completed!" -ForegroundColor Green
