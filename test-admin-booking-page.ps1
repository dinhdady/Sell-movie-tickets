# Test Admin Booking Page
Write-Host "Testing Admin Booking Page..." -ForegroundColor Green

# Start backend if not running
Write-Host "Starting backend..." -ForegroundColor Yellow
$backendProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue
if (-not $backendProcess) {
    Write-Host "Backend not running, starting it..." -ForegroundColor Yellow
    Start-Process -FilePath "mvnw.cmd" -ArgumentList "spring-boot:run" -WindowStyle Hidden
    Start-Sleep -Seconds 10
}

# Start frontend if not running
Write-Host "Starting frontend..." -ForegroundColor Yellow
$frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $frontendProcess) {
    Write-Host "Frontend not running, starting it..." -ForegroundColor Yellow
    Set-Location frontend
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden
    Set-Location ..
    Start-Sleep -Seconds 5
}

# Test admin booking API endpoints
Write-Host "Testing Admin Booking API endpoints..." -ForegroundColor Cyan

# Test 1: Admin bookings endpoint
Write-Host "Test 1: Admin bookings endpoint" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings" -Method GET -ContentType "application/json"
    Write-Host "Admin bookings API response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Bookings count: $($response.object.Count)" -ForegroundColor White
        if ($response.object.Count -gt 0) {
            Write-Host "First booking sample:" -ForegroundColor White
            $firstBooking = $response.object[0]
            Write-Host "  - ID: $($firstBooking.id)" -ForegroundColor Gray
            Write-Host "  - Customer: $($firstBooking.customerName)" -ForegroundColor Gray
            Write-Host "  - Movie: $($firstBooking.movie.title)" -ForegroundColor Gray
            Write-Host "  - Total Price: $($firstBooking.totalPrice)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Admin bookings API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test endpoint (no auth required)
Write-Host "Test 2: Test bookings endpoint (no auth)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings/test" -Method GET -ContentType "application/json"
    Write-Host "Test bookings API response:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    if ($response.object) {
        Write-Host "Bookings count: $($response.object.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "Test bookings API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Main booking API
Write-Host "Test 3: Main booking API" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/booking" -Method GET -ContentType "application/json"
    Write-Host "Main booking API response:" -ForegroundColor Green
    Write-Host "Bookings count: $($response.Count)" -ForegroundColor White
    if ($response.Count -gt 0) {
        Write-Host "First booking sample:" -ForegroundColor White
        $firstBooking = $response[0]
        Write-Host "  - ID: $($firstBooking.id)" -ForegroundColor Gray
        Write-Host "  - Customer: $($firstBooking.customerName)" -ForegroundColor Gray
        Write-Host "  - Movie: $($firstBooking.movie.title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Main booking API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check frontend accessibility
Write-Host "Test 4: Frontend accessibility" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/admin/bookings" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Admin booking page is accessible" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    } else {
        Write-Host "Admin booking page returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Frontend accessibility test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Admin Booking Page Test Complete!" -ForegroundColor Green
Write-Host "You can now access the admin booking page at: http://localhost:5173/admin/bookings" -ForegroundColor Cyan
Write-Host "Features available:" -ForegroundColor White
Write-Host "  - View all bookings with detailed information" -ForegroundColor Gray
Write-Host "  - Search and filter bookings" -ForegroundColor Gray
Write-Host "  - Export bookings to CSV" -ForegroundColor Gray
Write-Host "  - View detailed booking information in modal" -ForegroundColor Gray
Write-Host "  - Update booking status" -ForegroundColor Gray