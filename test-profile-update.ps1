# Script để test chức năng cập nhật profile
Write-Host "👤 Testing profile update functionality" -ForegroundColor Yellow

# Test 1: Lấy thông tin user hiện tại
Write-Host "`n🔍 Test 1: Getting current user profile..." -ForegroundColor Blue
try {
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/user/profile" -Method GET
    Write-Host "✅ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host "User ID: $($profileResponse.object.id)" -ForegroundColor Cyan
    Write-Host "Username: $($profileResponse.object.username)" -ForegroundColor Cyan
    Write-Host "Email: $($profileResponse.object.email)" -ForegroundColor Cyan
    Write-Host "Full Name: $($profileResponse.object.fullName)" -ForegroundColor Cyan
    Write-Host "Phone: $($profileResponse.object.phoneNumber)" -ForegroundColor Cyan
    
    $userId = $profileResponse.object.id
} catch {
    Write-Host "❌ Error getting profile: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Cập nhật thông tin profile
Write-Host "`n🔍 Test 2: Updating user profile..." -ForegroundColor Blue
$updateData = @{
    fullName = "Test User Updated"
    phoneNumber = "0123456789"
}

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/user/$userId/profile" -Method PUT -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Profile updated successfully!" -ForegroundColor Green
    Write-Host "Updated Full Name: $($updateResponse.object.fullName)" -ForegroundColor Cyan
    Write-Host "Updated Phone: $($updateResponse.object.phoneNumber)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error updating profile: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 3: Kiểm tra thông tin sau khi cập nhật
Write-Host "`n🔍 Test 3: Verifying updated profile..." -ForegroundColor Blue
try {
    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/user/profile" -Method GET
    Write-Host "✅ Profile verification successful!" -ForegroundColor Green
    Write-Host "Current Full Name: $($verifyResponse.object.fullName)" -ForegroundColor Cyan
    Write-Host "Current Phone: $($verifyResponse.object.phoneNumber)" -ForegroundColor Cyan
    
    if ($verifyResponse.object.fullName -eq "Test User Updated") {
        Write-Host "✅ Full name update confirmed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Full name update not reflected" -ForegroundColor Yellow
    }
    
    if ($verifyResponse.object.phoneNumber -eq "0123456789") {
        Write-Host "✅ Phone number update confirmed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Phone number update not reflected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error verifying profile: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test với dữ liệu không hợp lệ
Write-Host "`n🔍 Test 4: Testing with invalid data..." -ForegroundColor Blue
$invalidData = @{
    fullName = ""
    phoneNumber = "invalid-phone"
}

try {
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/user/$userId/profile" -Method PUT -Body ($invalidData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "⚠️ Invalid data was accepted (unexpected)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Invalid data properly rejected" -ForegroundColor Green
    Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Cyan
}

Write-Host "`n🌐 Test frontend at: http://localhost:5173/profile" -ForegroundColor Yellow
Write-Host "`n🎯 Steps to test in frontend:" -ForegroundColor Blue
Write-Host "1. Go to profile page" -ForegroundColor White
Write-Host "2. Click 'Chỉnh sửa' button" -ForegroundColor White
Write-Host "3. Update full name and phone number" -ForegroundColor White
Write-Host "4. Click 'Lưu' button" -ForegroundColor White
Write-Host "5. Verify changes are saved" -ForegroundColor White

Write-Host "`n📋 API Endpoints tested:" -ForegroundColor Blue
Write-Host "✅ GET /api/user/profile - Get current user profile" -ForegroundColor Green
Write-Host "✅ PUT /api/user/{userId}/profile - Update user profile" -ForegroundColor Green
Write-Host "✅ Error handling for invalid data" -ForegroundColor Green

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
