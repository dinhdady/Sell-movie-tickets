# Script để restart ứng dụng sau khi sửa lỗi Movie reference
Write-Host "🔄 Restarting application after Movie reference fix..." -ForegroundColor Yellow

# Tìm process Java (Spring Boot)
Write-Host "`n🔍 Looking for running Spring Boot application..." -ForegroundColor Blue
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Write-Host "Found $($javaProcesses.Count) Java processes:" -ForegroundColor Cyan
    foreach ($process in $javaProcesses) {
        Write-Host "  PID: $($process.Id) - $($process.ProcessName) - $($process.MainWindowTitle)" -ForegroundColor White
    }
    
    # Tìm process Spring Boot (thường có port 8080)
    $springBootProcess = $javaProcesses | Where-Object { 
        $_.CommandLine -like "*spring*" -or 
        $_.CommandLine -like "*movie*" -or
        $_.CommandLine -like "*8080*"
    }
    
    if ($springBootProcess) {
        Write-Host "`n🛑 Stopping Spring Boot application..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $springBootProcess.Id -Force
            Write-Host "✅ Spring Boot application stopped" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "❌ Error stopping application: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Spring Boot process not found, trying to stop all Java processes..." -ForegroundColor Yellow
        try {
            Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Java processes stopped" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "❌ Error stopping Java processes: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️ No Java processes found" -ForegroundColor Cyan
}

# Kiểm tra port 8080
Write-Host "`n🔍 Checking port 8080..." -ForegroundColor Blue
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "⚠️ Port 8080 is still in use by PID: $($port8080.OwningProcess)" -ForegroundColor Yellow
    try {
        Stop-Process -Id $port8080.OwningProcess -Force
        Write-Host "✅ Process using port 8080 stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "❌ Error stopping process on port 8080: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Port 8080 is free" -ForegroundColor Green
}

# Restart Spring Boot application
Write-Host "`n🚀 Starting Spring Boot application..." -ForegroundColor Blue
try {
    # Tìm file JAR hoặc chạy Maven
    if (Test-Path "target\*.jar") {
        $jarFile = Get-ChildItem "target\*.jar" | Select-Object -First 1
        Write-Host "Found JAR file: $($jarFile.Name)" -ForegroundColor Cyan
        Start-Process -FilePath "java" -ArgumentList "-jar", $jarFile.FullName -WindowStyle Minimized
        Write-Host "✅ Spring Boot application started with JAR" -ForegroundColor Green
    } else {
        Write-Host "JAR file not found, trying Maven..." -ForegroundColor Yellow
        if (Test-Path "pom.xml") {
            Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Minimized
            Write-Host "✅ Spring Boot application started with Maven" -ForegroundColor Green
        } else {
            Write-Host "❌ Neither JAR nor pom.xml found" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error starting application: $($_.Exception.Message)" -ForegroundColor Red
}

# Chờ ứng dụng khởi động
Write-Host "`n⏳ Waiting for application to start..." -ForegroundColor Blue
$maxWait = 30
$waited = 0
$appStarted = $false

while ($waited -lt $maxWait -and -not $appStarted) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/movie" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $appStarted = $true
            Write-Host "✅ Application is running!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
}

if (-not $appStarted) {
    Write-Host "`n⚠️ Application may not have started properly" -ForegroundColor Yellow
    Write-Host "Please check the application logs" -ForegroundColor White
} else {
    Write-Host "`n🎉 Application restarted successfully!" -ForegroundColor Green
}

Write-Host "`n🌐 Test the application:" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8080/api/movie" -ForegroundColor Cyan

Write-Host "`n📋 If the Movie reference error persists:" -ForegroundColor Yellow
Write-Host "1. Run the SQL scripts manually" -ForegroundColor White
Write-Host "2. Check database connection" -ForegroundColor White
Write-Host "3. Verify foreign key constraints" -ForegroundColor White

Write-Host "`n🏁 Restart process completed" -ForegroundColor Green
