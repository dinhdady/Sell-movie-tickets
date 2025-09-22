# Script để start backend
Write-Host "🚀 Starting backend..." -ForegroundColor Yellow

# Kiểm tra Java
Write-Host "`n🔍 Checking Java..." -ForegroundColor Blue
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java version: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found!" -ForegroundColor Red
    exit 1
}

# Kiểm tra Maven
Write-Host "`n🔍 Checking Maven..." -ForegroundColor Blue
try {
    $mavenVersion = mvn -version 2>&1
    Write-Host "Maven version: $mavenVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven not found!" -ForegroundColor Red
    Write-Host "Trying to use Maven wrapper..." -ForegroundColor Yellow
    
    if (Test-Path "mvnw.cmd") {
        Write-Host "Found Maven wrapper!" -ForegroundColor Green
        $mavenCmd = ".\mvnw.cmd"
    } else {
        Write-Host "❌ Maven wrapper not found!" -ForegroundColor Red
        exit 1
    }
} else {
    $mavenCmd = "mvn"
}

# Compile project
Write-Host "`n🔍 Compiling project..." -ForegroundColor Blue
try {
    & $mavenCmd clean compile
    Write-Host "✅ Compilation successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Start backend
Write-Host "`n🔍 Starting backend..." -ForegroundColor Blue
try {
    & $mavenCmd spring-boot:run
} catch {
    Write-Host "❌ Failed to start backend!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
