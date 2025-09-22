# Run Database Fix Script
Write-Host "🔧 Running Database Fix Script..." -ForegroundColor Green

# Check if backend is running
Write-Host "🔍 Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/testing/hello" -Method GET -UseBasicParsing
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Please start it first." -ForegroundColor Red
    Write-Host "Run: java -jar target/movie-0.0.1-SNAPSHOT.jar" -ForegroundColor Yellow
    exit 1
}

# Test current state
Write-Host "`n🧪 Testing current API state..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings/test" -Method GET
    Write-Host "✅ Test endpoint working" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Test endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This confirms the database integrity issue" -ForegroundColor Yellow
}

Write-Host "`n📋 Database Fix Instructions:" -ForegroundColor Yellow
Write-Host "1. Connect to your database (MySQL/PostgreSQL)" -ForegroundColor White
Write-Host "2. Run the SQL script: fix-orphaned-bookings.sql" -ForegroundColor White
Write-Host "3. This will:" -ForegroundColor White
Write-Host "   - Identify orphaned booking records" -ForegroundColor Gray
Write-Host "   - Delete orphaned showtime_seat_booking records" -ForegroundColor Gray
Write-Host "   - Delete orphaned ticket records" -ForegroundColor Gray
Write-Host "   - Set showtime_id to NULL for orphaned bookings" -ForegroundColor Gray
Write-Host "   - Show data integrity summary" -ForegroundColor Gray

Write-Host "`n🔧 Alternative: Create a test showtime" -ForegroundColor Yellow
Write-Host "If you want to keep the existing bookings, create a showtime with ID=1:" -ForegroundColor White
Write-Host "INSERT INTO showtime (id, start_time, end_time, movie_id, room_id) VALUES (1, '2024-01-01 10:00:00', '2024-01-01 12:00:00', 1, 1);" -ForegroundColor Gray

Write-Host "`n🎯 After running the database fix, test the admin page again:" -ForegroundColor Cyan
Write-Host "http://localhost:5173/admin/bookings" -ForegroundColor White

