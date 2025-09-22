# Script để test API order
Write-Host "🧪 Testing Order API..." -ForegroundColor Yellow

# Test 1: Lấy user ID từ database
Write-Host "`n🔍 Test 1: Getting user ID from database..." -ForegroundColor Blue

$getUserSQL = @"
SELECT id, username, email FROM users WHERE role = 'USER' LIMIT 1;
"@

$getUserSQL | Out-File -FilePath "get_user.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: get_user.sql" -ForegroundColor Green
Write-Host "Run: mysql -u root -p < get_user.sql" -ForegroundColor Cyan

# Test 2: Test với user ID giả
Write-Host "`n🔍 Test 2: Testing with fake user ID..." -ForegroundColor Blue

$testOrderData = @{
    userId = "test123"
    totalPrice = 100000
    customerEmail = "test@example.com"
} | ConvertTo-Json

Write-Host "Test data: $testOrderData" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $testOrderData -ContentType "application/json"
    Write-Host "✅ Order API response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Order API error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error body: $errorBody" -ForegroundColor Red
    }
}

# Test 3: Test với dữ liệu hợp lệ
Write-Host "`n🔍 Test 3: Testing with valid data..." -ForegroundColor Blue

$validOrderData = @{
    userId = "user1"  # Thay bằng user ID thực từ database
    totalPrice = 150000
    customerEmail = "user1@example.com"
} | ConvertTo-Json

Write-Host "Valid data: $validOrderData" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $validOrderData -ContentType "application/json"
    Write-Host "✅ Valid Order API response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
} catch {
    Write-Host "❌ Valid Order API error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error body: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Debug steps:" -ForegroundColor Blue
Write-Host "1. Check backend logs for detailed error messages" -ForegroundColor White
Write-Host "2. Verify user exists in database" -ForegroundColor White
Write-Host "3. Check Order model compilation" -ForegroundColor White
Write-Host "4. Check OrderService.createOrder method" -ForegroundColor White

Write-Host "`n🏁 Order API test completed" -ForegroundColor Green
