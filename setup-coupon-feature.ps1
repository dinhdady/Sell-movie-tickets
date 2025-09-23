# Script to setup coupon and event features
Write-Host "=== SETTING UP COUPON & EVENT FEATURES ===" -ForegroundColor Green

# Check if database migration file exists
$migrationFile = "src\main\resources\db\migration\V2__Create_Coupon_Event_Tables.sql"
if (Test-Path $migrationFile) {
    Write-Host "✅ Database migration file found: $migrationFile" -ForegroundColor Green
} else {
    Write-Host "❌ Database migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== DATABASE MIGRATION INSTRUCTIONS ===" -ForegroundColor Yellow
Write-Host "1. Start your MySQL server" -ForegroundColor White
Write-Host "2. Connect to your database" -ForegroundColor White
Write-Host "3. Run the migration file:" -ForegroundColor White
Write-Host "   mysql -u your_username -p your_database_name < $migrationFile" -ForegroundColor Cyan
Write-Host "`nOr use Flyway if configured:" -ForegroundColor White
Write-Host "   mvn flyway:migrate" -ForegroundColor Cyan

Write-Host "`n=== STARTING APPLICATION ===" -ForegroundColor Yellow
Write-Host "Starting backend and frontend..." -ForegroundColor White

# Start backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"cd '$PWD'; mvn spring-boot:run`"" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"cd '$PWD\frontend'; npm run dev`"" -WindowStyle Normal

Write-Host "`n=== APPLICATION STARTED ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`n=== COUPON MANAGEMENT ===" -ForegroundColor Yellow
Write-Host "1. Login as admin user" -ForegroundColor White
Write-Host "2. Go to Admin Panel: http://localhost:5173/admin" -ForegroundColor White
Write-Host "3. Click on 'Coupon' menu to manage coupons" -ForegroundColor White
Write-Host "4. Click on 'Sự kiện' menu to manage events" -ForegroundColor White
Write-Host "`n=== TESTING COUPONS ===" -ForegroundColor Yellow
Write-Host "Sample coupons created:" -ForegroundColor White
Write-Host "- WELCOME10: 10% discount, min order 100k VNĐ" -ForegroundColor Cyan
Write-Host "- SAVE50K: 50k VNĐ discount, min order 200k VNĐ" -ForegroundColor Cyan
Write-Host "- VIP20: 20% discount, min order 300k VNĐ" -ForegroundColor Cyan
Write-Host "`n=== TESTING EVENTS ===" -ForegroundColor Yellow
Write-Host "Sample events created:" -ForegroundColor White
Write-Host "- Tết Nguyên Đán 2025: 20% discount" -ForegroundColor Cyan
Write-Host "- Khuyến mãi cuối năm: 100k VNĐ discount" -ForegroundColor Cyan
Write-Host "- Ngày lễ tình nhân: 15% discount" -ForegroundColor Cyan

Write-Host "`nPress any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
