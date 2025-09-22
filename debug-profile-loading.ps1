# Debug script for Profile page loading
Write-Host "Debugging Profile Page Loading..." -ForegroundColor Green

$baseUrl = "http://localhost:8080/api"

# Test the primary API endpoint
Write-Host "`nTesting primary API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/test" -Method GET
    Write-Host "API Response Status: $($response.state)" -ForegroundColor White
    Write-Host "Total Tickets: $($response.object.Count)" -ForegroundColor White
    
    # Check for specific email
    $testEmail = "dinhhoang2207004@gmail.com"
    $userTickets = $response.object | Where-Object { $_.customerEmail -eq $testEmail }
    Write-Host "Tickets for $testEmail : $($userTickets.Count)" -ForegroundColor Cyan
    
    if ($userTickets.Count -gt 0) {
        Write-Host "✅ Data is available for filtering" -ForegroundColor Green
    } else {
        Write-Host "❌ No data found for test email" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile in browser" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12)" -ForegroundColor White
Write-Host "3. Check Console tab for logs" -ForegroundColor White
Write-Host "4. Look for '🎯 [Profile]' messages" -ForegroundColor White
