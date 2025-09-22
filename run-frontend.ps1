# Script chạy frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Green

# Kiểm tra Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra npm
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Chuyển đến thư mục frontend
Set-Location frontend

# Kiểm tra package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found in frontend directory" -ForegroundColor Red
    exit 1
}

# Cài đặt dependencies (nếu cần)
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Chạy frontend
Write-Host "🚀 Starting frontend development server..." -ForegroundColor Blue
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the frontend" -ForegroundColor Yellow

npm run dev
