# Script để debug login response
Write-Host "🔍 Debugging login response..." -ForegroundColor Yellow

$loginData = @{
    username = "testuser487"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Full response: $($loginResponse | ConvertTo-Json -Depth 5)" -ForegroundColor White
    
    Write-Host "`n🔍 Response structure:" -ForegroundColor Blue
    Write-Host "State: $($loginResponse.state)" -ForegroundColor Cyan
    Write-Host "Message: $($loginResponse.message)" -ForegroundColor Cyan
    
    if ($loginResponse.object) {
        Write-Host "`n🔍 Object structure:" -ForegroundColor Blue
        Write-Host "AccessToken: $($loginResponse.object.accessToken)" -ForegroundColor Cyan
        Write-Host "RefreshToken: $($loginResponse.object.refreshToken)" -ForegroundColor Cyan
        
        if ($loginResponse.object.user) {
            Write-Host "`n🔍 User structure:" -ForegroundColor Blue
            Write-Host "User: $($loginResponse.object.user | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
            Write-Host "User ID: $($loginResponse.object.user.id)" -ForegroundColor Cyan
            Write-Host "Username: $($loginResponse.object.user.username)" -ForegroundColor Cyan
            Write-Host "Email: $($loginResponse.object.user.email)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ No user object in response" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No object in response" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Debug completed" -ForegroundColor Green
