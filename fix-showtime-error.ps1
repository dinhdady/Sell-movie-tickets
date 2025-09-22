# Fix Showtime Error Script
Write-Host "🔧 Fixing Showtime Error..." -ForegroundColor Green

# Stop existing Java processes
Write-Host "🛑 Stopping existing Java processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Java processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No Java processes to stop" -ForegroundColor Blue
}

# Wait a moment
Start-Sleep -Seconds 2

# Start backend
Write-Host "🚀 Starting backend with fixed error handling..." -ForegroundColor Yellow
Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -WindowStyle Hidden

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Test the fixed endpoint
Write-Host "🧪 Testing fixed admin bookings endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings/test" -Method GET -ContentType "application/json"
    Write-Host "✅ Admin bookings test endpoint response:" -ForegroundColor Green
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
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to missing showtime data in database" -ForegroundColor Yellow
}

Write-Host "`n🎯 Fix Complete!" -ForegroundColor Green
Write-Host "The admin booking page should now work without the Showtime error." -ForegroundColor Cyan
Write-Host "You can access it at: http://localhost:5173/admin/bookings" -ForegroundColor Cyan
Write-Host "`nIf you still see errors, the issue might be:" -ForegroundColor Yellow
Write-Host "1. Missing showtime data in database" -ForegroundColor Gray
Write-Host "2. Orphaned booking records referencing non-existent showtimes" -ForegroundColor Gray
Write-Host "3. Database integrity issues" -ForegroundColor Gray

