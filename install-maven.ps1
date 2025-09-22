# Script cài đặt Maven và chạy ứng dụng
Write-Host "🚀 Installing Maven and running application..." -ForegroundColor Green

# Kiểm tra xem Maven đã được cài đặt chưa
try {
    $mavenVersion = mvn -version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Maven is already installed" -ForegroundColor Green
        Write-Host $mavenVersion
    }
} catch {
    Write-Host "❌ Maven not found. Installing..." -ForegroundColor Yellow
    
    # Cài đặt Maven qua Chocolatey
    try {
        # Kiểm tra Chocolatey
        $chocoVersion = choco --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Chocolatey found. Installing Maven..." -ForegroundColor Green
            choco install maven -y
        } else {
            Write-Host "❌ Chocolatey not found. Installing Chocolatey first..." -ForegroundColor Yellow
            # Cài đặt Chocolatey
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            
            # Cài đặt Maven
            choco install maven -y
        }
    } catch {
        Write-Host "❌ Failed to install Maven via Chocolatey. Please install manually." -ForegroundColor Red
        Write-Host "Download from: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
        exit 1
    }
}

# Kiểm tra lại Maven
try {
    $mavenVersion = mvn -version
    Write-Host "✅ Maven installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven installation failed" -ForegroundColor Red
    exit 1
}

# Build và chạy ứng dụng
Write-Host "🔨 Building application..." -ForegroundColor Blue
mvn clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    Write-Host "🚀 Starting application..." -ForegroundColor Blue
    java -jar target/movie-0.0.1-SNAPSHOT.jar
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
