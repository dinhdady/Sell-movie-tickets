# Test API để kiểm tra users
Write-Host "🔍 Testing user API..." -ForegroundColor Blue

try {
    # Lấy danh sách users (cần admin token)
     = Invoke-RestMethod -Uri "http://localhost:8080/api/user/admin/all" -Method GET
    Write-Host "✅ Users retrieved successfully!" -ForegroundColor Green
    Write-Host "Total users: 0" -ForegroundColor Cyan
    
    foreach ( in .object) {
        Write-Host "  -  () - Verified: " -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error retrieving users: " -ForegroundColor Red
    Write-Host "This might be because you need admin authentication" -ForegroundColor Yellow
}
