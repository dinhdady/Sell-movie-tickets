# Script debug authentication
Write-Host "🔍 Debugging Authentication..." -ForegroundColor Green

Write-Host "`n1. Checking if user is logged in..." -ForegroundColor Yellow
Write-Host "Please open browser console and run:" -ForegroundColor Cyan
Write-Host "   console.log('Token:', localStorage.getItem('token'))" -ForegroundColor Cyan
Write-Host "   console.log('User:', localStorage.getItem('user'))" -ForegroundColor Cyan
Write-Host "   console.log('RefreshToken:', localStorage.getItem('refreshToken'))" -ForegroundColor Cyan

Write-Host "`n2. If no token, please login first:" -ForegroundColor Yellow
Write-Host "   - Go to http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "   - Login with admin account" -ForegroundColor Cyan
Write-Host "   - Check if token is stored in localStorage" -ForegroundColor Cyan

Write-Host "`n3. If token exists but API fails, check:" -ForegroundColor Yellow
Write-Host "   - Token format: Should start with 'eyJ'" -ForegroundColor Cyan
Write-Host "   - Token expiration: Check if token is expired" -ForegroundColor Cyan
Write-Host "   - User role: Should be ADMIN" -ForegroundColor Cyan

Write-Host "`n4. Test API call in browser console:" -ForegroundColor Yellow
Write-Host "   fetch('http://localhost:8080/api/admin/bookings', {" -ForegroundColor Cyan
Write-Host "     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }" -ForegroundColor Cyan
Write-Host "   }).then(r => r.json()).then(console.log)" -ForegroundColor Cyan

Write-Host "`n🎯 Debug completed!" -ForegroundColor Green
