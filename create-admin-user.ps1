# Script để tạo admin user
Write-Host "🔧 Creating admin user..." -ForegroundColor Yellow

# Tạo admin user trực tiếp trong database
$createAdminSQL = @"
INSERT INTO users (id, username, email, password, full_name, phone, role, is_active, is_email_verified, created_at, updated_at) 
VALUES (
    'admin123',
    'admin',
    'admin@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Admin User',
    '0123456789',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    password = VALUES(password),
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    role = VALUES(role),
    is_active = VALUES(is_active),
    is_email_verified = VALUES(is_email_verified),
    updated_at = NOW();
"@

$createAdminSQL | Out-File -FilePath "create_admin.sql" -Encoding UTF8

Write-Host "📝 Created SQL script: create_admin.sql" -ForegroundColor Green
Write-Host "Run: mysql -u root -p < create_admin.sql" -ForegroundColor Cyan

Write-Host "`n🔍 Alternative: Test với user có sẵn..." -ForegroundColor Blue

# Thử đăng nhập với user có sẵn
$loginData = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Full response: $($loginResponse | ConvertTo-Json -Depth 5)" -ForegroundColor White
    
    $token = $loginResponse.object.accessToken
    $userId = $loginResponse.object.user.id
    
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host "User ID: $userId" -ForegroundColor Cyan
    
    # Test tạo order
    Write-Host "`n🔍 Creating order..." -ForegroundColor Blue
    
    $orderData = @{
        userId = $userId
        showtimeId = 6
        totalPrice = 180000
        customerEmail = "admin@example.com"
        customerName = "Admin User"
        customerPhone = "0123456789"
        customerAddress = "123 Admin Street"
    } | ConvertTo-Json
    
    Write-Host "Order data: $orderData" -ForegroundColor Cyan
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $orderResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/order" -Method POST -Body $orderData -Headers $headers
        Write-Host "✅ Order created successfully!" -ForegroundColor Green
        Write-Host "Order response: $($orderResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
    } catch {
        Write-Host "❌ Order creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Admin user test completed" -ForegroundColor Green
