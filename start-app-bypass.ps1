# Script to start both backend and frontend with execution policy bypass
Write-Host "=== STARTING CINEMA TICKET SYSTEM ===" -ForegroundColor Green

# Start backend in background
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"cd '$PWD'; mvn spring-boot:run`"" -WindowStyle Normal

# Wait a bit for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -Command `"cd '$PWD\frontend'; npm run dev`"" -WindowStyle Normal

Write-Host "=== APPLICATION STARTED ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
