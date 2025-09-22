# Script kiểm tra trạng thái authentication
Write-Host "🔍 Checking Authentication Status..." -ForegroundColor Green

Write-Host "`n1. Please open browser console and run these commands:" -ForegroundColor Yellow
Write-Host "   console.log('=== AUTH STATUS ===')" -ForegroundColor Cyan
Write-Host "   console.log('Token:', localStorage.getItem('token'))" -ForegroundColor Cyan
Write-Host "   console.log('User:', localStorage.getItem('user'))" -ForegroundColor Cyan
Write-Host "   console.log('RefreshToken:', localStorage.getItem('refreshToken'))" -ForegroundColor Cyan

Write-Host "`n2. Check if user has ADMIN role:" -ForegroundColor Yellow
Write-Host "   const user = JSON.parse(localStorage.getItem('user') || '{}')" -ForegroundColor Cyan
Write-Host "   console.log('User role:', user.role)" -ForegroundColor Cyan
Write-Host "   console.log('Is admin:', user.role === 'ADMIN')" -ForegroundColor Cyan

Write-Host "`n3. Test API call with current token:" -ForegroundColor Yellow
Write-Host "   fetch('http://localhost:8080/api/admin/bookings', {" -ForegroundColor Cyan
Write-Host "     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }" -ForegroundColor Cyan
Write-Host "   }).then(r => {" -ForegroundColor Cyan
Write-Host "     console.log('Status:', r.status)" -ForegroundColor Cyan
Write-Host "     return r.json()" -ForegroundColor Cyan
Write-Host "   }).then(console.log)" -ForegroundColor Cyan

Write-Host "`n4. If no token or wrong role:" -ForegroundColor Yellow
Write-Host "   - Go to http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "   - Login with admin account (role: ADMIN)" -ForegroundColor Cyan
Write-Host "   - Check localStorage again" -ForegroundColor Cyan

Write-Host "`n🎯 Check completed!" -ForegroundColor Green
