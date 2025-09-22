# Script để kiểm tra các loại TEXT trong MySQL
Write-Host "📊 Checking MySQL TEXT types and sizes" -ForegroundColor Yellow

$sqlQuery = @"
USE movietickets;

-- Hiển thị thông tin về cột description
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    CHARACTER_SET_NAME,
    COLLATION_NAME,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'movietickets' 
  AND TABLE_NAME = 'movies' 
  AND COLUMN_NAME = 'description';

-- Hiển thị thông tin về tất cả các cột TEXT trong bảng movies
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'movietickets' 
  AND TABLE_NAME = 'movies' 
  AND DATA_TYPE LIKE '%TEXT%'
ORDER BY CHARACTER_MAXIMUM_LENGTH DESC;

-- Hiển thị kích thước tối đa của các loại TEXT
SELECT 
    'TINYTEXT' as TEXT_TYPE,
    255 as MAX_CHARS,
    '255 bytes' as MAX_SIZE
UNION ALL
SELECT 
    'TEXT' as TEXT_TYPE,
    65535 as MAX_CHARS,
    '64KB' as MAX_SIZE
UNION ALL
SELECT 
    'MEDIUMTEXT' as TEXT_TYPE,
    16777215 as MAX_CHARS,
    '16MB' as MAX_SIZE
UNION ALL
SELECT 
    'LONGTEXT' as TEXT_TYPE,
    4294967295 as MAX_CHARS,
    '4GB' as MAX_SIZE;
"@

Write-Host "🔍 Querying database information..." -ForegroundColor Blue

try {
    $mysqlCommand = "mysql -u root -p -e `"$sqlQuery`""
    Write-Host "Executing MySQL query..." -ForegroundColor Cyan
    
    Invoke-Expression $mysqlCommand
    
    Write-Host "`n✅ Database information retrieved successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error querying database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure MySQL is running and you have the correct credentials" -ForegroundColor Yellow
}

Write-Host "`n📋 TEXT Type Comparison:" -ForegroundColor Blue
Write-Host "  TINYTEXT:  255 characters (255 bytes)" -ForegroundColor Cyan
Write-Host "  TEXT:      65,535 characters (64KB)" -ForegroundColor Cyan
Write-Host "  MEDIUMTEXT: 16,777,215 characters (16MB)" -ForegroundColor Cyan
Write-Host "  LONGTEXT:  4,294,967,295 characters (4GB)" -ForegroundColor Green

Write-Host "`n🏁 Check completed" -ForegroundColor Blue
