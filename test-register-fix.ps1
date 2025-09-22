# Script để test chức năng đăng ký sau khi sửa lỗi
Write-Host "🔧 Testing register functionality after fix..." -ForegroundColor Yellow

# Test 1: Đăng ký tài khoản mới
Write-Host "`n🔍 Test 1: Registering new user..." -ForegroundColor Blue
$registerData = @{
    username = "testuser$(Get-Random -Maximum 1000)"
    email = "test$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "Test User"
    phone = "0123456789"
} | ConvertTo-Json

Write-Host "Register data: $registerData" -ForegroundColor Cyan

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
    
    if ($registerResponse.object.verificationRequired) {
        Write-Host "✅ Email verification required - working correctly!" -ForegroundColor Green
        Write-Host "Email: $($registerResponse.object.email)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Email verification not required - check configuration" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Đăng ký với email đã tồn tại
Write-Host "`n🔍 Test 2: Registering with existing email..." -ForegroundColor Blue
$existingEmailData = @{
    username = "testuser$(Get-Random -Maximum 1000)"
    email = "admin@example.com"  # Email đã tồn tại
    password = "password123"
    fullName = "Test User"
    phone = "0123456789"
} | ConvertTo-Json

try {
    $existingEmailResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $existingEmailData -ContentType "application/json"
    Write-Host "⚠️ Existing email was accepted (unexpected)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Existing email properly rejected" -ForegroundColor Green
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error message: $errorBody" -ForegroundColor Cyan
    }
}

# Test 3: Đăng ký với username đã tồn tại
Write-Host "`n🔍 Test 3: Registering with existing username..." -ForegroundColor Blue
$existingUsernameData = @{
    username = "admin"  # Username đã tồn tại
    email = "test$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
    fullName = "Test User"
    phone = "0123456789"
} | ConvertTo-Json

try {
    $existingUsernameResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $existingUsernameData -ContentType "application/json"
    Write-Host "⚠️ Existing username was accepted (unexpected)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Existing username properly rejected" -ForegroundColor Green
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error message: $errorBody" -ForegroundColor Cyan
    }
}

# Test 4: Đăng ký với dữ liệu không hợp lệ
Write-Host "`n🔍 Test 4: Registering with invalid data..." -ForegroundColor Blue
$invalidData = @{
    username = ""
    email = "invalid-email"
    password = "123"  # Quá ngắn
    fullName = ""
    phone = ""
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $invalidData -ContentType "application/json"
    Write-Host "⚠️ Invalid data was accepted (unexpected)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Invalid data properly rejected" -ForegroundColor Green
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error message: $errorBody" -ForegroundColor Cyan
    }
}

Write-Host "`n🌐 Test frontend at:" -ForegroundColor Blue
Write-Host "Register: http://localhost:5173/register" -ForegroundColor Cyan
Write-Host "Email Verification: http://localhost:5173/verify-email" -ForegroundColor Cyan

Write-Host "`n📋 Expected behavior:" -ForegroundColor Blue
Write-Host "1. Registration should succeed with verification required" -ForegroundColor White
Write-Host "2. Existing email/username should be rejected" -ForegroundColor White
Write-Host "3. Invalid data should be rejected" -ForegroundColor White
Write-Host "4. Email verification should be sent" -ForegroundColor White

Write-Host "`n🏁 Register fix test completed" -ForegroundColor Green
