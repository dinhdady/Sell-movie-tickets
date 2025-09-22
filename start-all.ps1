# Script chạy cả backend và frontend
Write-Host "🚀 Starting Cinema Movie Booking System (Full Stack)..." -ForegroundColor Green

# Kiểm tra các dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Blue

# Kiểm tra Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java 17 or higher." -ForegroundColor Red
    exit 1
}

# Kiểm tra Maven
try {
    $mavenVersion = mvn -version 2>&1
    Write-Host "✅ Maven found" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven not found. Please install Maven." -ForegroundColor Red
    Write-Host "Run: .\install-maven.ps1" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Kiểm tra MySQL
Write-Host "🔍 Checking MySQL..." -ForegroundColor Blue
try {
    $mysqlTest = mysql -u root -p123456789 -e "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ MySQL connection failed. Please check your database." -ForegroundColor Red
        Write-Host "Make sure MySQL is running and credentials are correct." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  MySQL not found in PATH. Please ensure MySQL is running." -ForegroundColor Yellow
}

# Build backend
Write-Host "🔨 Building backend..." -ForegroundColor Blue
mvn clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "🎨 Building frontend..." -ForegroundColor Blue
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies!" -ForegroundColor Red
        exit 1
    }
}

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Copy frontend build to backend
Write-Host "📋 Copying frontend to backend..." -ForegroundColor Blue
Copy-Item -Path "dist/*" -Destination "../src/main/resources/static/" -Recurse -Force

# Rebuild backend with frontend
Write-Host "🔄 Rebuilding backend with frontend..." -ForegroundColor Blue
Set-Location ..
mvn package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Final build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Final build failed!" -ForegroundColor Red
    exit 1
}

# Chạy ứng dụng
Write-Host "🚀 Starting application..." -ForegroundColor Blue
Write-Host "Application will run on: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow

java -jar target/movie-0.0.1-SNAPSHOT.jar
