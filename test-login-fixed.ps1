# Script để test login sau khi fix
Write-Host "🧪 Testing login after fix..." -ForegroundColor Yellow

# Test với user có sẵn
Write-Host "`n🔍 Testing login with existing user..." -ForegroundColor Blue
$loginData = @{
    username = "user1"
    password = "password123"
} | ConvertTo-Json

Write-Host "Login data: $loginData" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Full response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor White
    
    if ($response.object.user) {
        Write-Host "`n🔍 User object found:" -ForegroundColor Blue
        Write-Host "User ID: $($response.object.user.id)" -ForegroundColor Cyan
        Write-Host "Username: $($response.object.user.username)" -ForegroundColor Cyan
        Write-Host "Email: $($response.object.user.email)" -ForegroundColor Cyan
        Write-Host "Role: $($response.object.user.role)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ No user object in response" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Login test completed" -ForegroundColor Green
