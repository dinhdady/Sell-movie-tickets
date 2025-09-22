# Script để cập nhật kích thước cột description
Write-Host "📝 Updating description column size to LONGTEXT" -ForegroundColor Yellow

# Đọc file SQL
$sqlFile = "update-description-column.sql"
if (Test-Path $sqlFile) {
    $sqlContent = Get-Content $sqlFile -Raw
    Write-Host "📄 SQL content loaded from $sqlFile" -ForegroundColor Blue
} else {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

# Kết nối MySQL và chạy SQL
Write-Host "🔌 Connecting to MySQL database..." -ForegroundColor Blue

try {
    # Sử dụng mysql command line client
    $mysqlCommand = "mysql -u root -p -e `"$sqlContent`""
    Write-Host "Executing: $mysqlCommand" -ForegroundColor Cyan
    
    # Chạy command
    Invoke-Expression $mysqlCommand
    
    Write-Host "✅ Description column updated successfully!" -ForegroundColor Green
    Write-Host "📊 New column type: LONGTEXT" -ForegroundColor Green
    Write-Host "📏 Maximum characters: 4,294,967,295" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error updating database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure MySQL is running and you have the correct credentials" -ForegroundColor Yellow
}

Write-Host "`n🏁 Update completed" -ForegroundColor Blue
