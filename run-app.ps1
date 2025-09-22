# Script chạy ứng dụng an toàn
Write-Host "🚀 Starting Cinema Movie Booking System..." -ForegroundColor Green

# Kiểm tra Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found:" -ForegroundColor Green
    Write-Host $javaVersion[0]
} catch {
    Write-Host "❌ Java not found. Please install Java 17 or higher." -ForegroundColor Red
    exit 1
}

# Kiểm tra Maven
try {
    $mavenVersion = mvn -version 2>&1
    Write-Host "✅ Maven found:" -ForegroundColor Green
    Write-Host $mavenVersion[0]
} catch {
    Write-Host "❌ Maven not found. Please install Maven." -ForegroundColor Red
    Write-Host "Run: .\install-maven.ps1" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra MySQL
Write-Host "🔍 Checking MySQL connection..." -ForegroundColor Blue
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

# Build ứng dụng
Write-Host "🔨 Building application..." -ForegroundColor Blue
mvn clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Kiểm tra JAR file
    if (Test-Path "target/movie-0.0.1-SNAPSHOT.jar") {
        Write-Host "✅ JAR file created successfully!" -ForegroundColor Green
        
        # Chạy ứng dụng
        Write-Host "🚀 Starting application..." -ForegroundColor Blue
        Write-Host "Backend will run on: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
        
        java -jar target/movie-0.0.1-SNAPSHOT.jar
    } else {
        Write-Host "❌ JAR file not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
