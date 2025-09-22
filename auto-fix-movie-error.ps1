# Script tự động sửa lỗi Movie reference
Write-Host "🤖 Auto-fixing Movie reference error..." -ForegroundColor Yellow

# Tìm MySQL executable
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.21\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "❌ MySQL executable not found. Please install MySQL or update the paths." -ForegroundColor Red
    Write-Host "Trying to use mysql command directly..." -ForegroundColor Yellow
    $mysqlExe = "mysql"
}

Write-Host "Using MySQL: $mysqlExe" -ForegroundColor Cyan

# Tạo script SQL để sửa lỗi
$fixSQL = @"
USE movietickets;

-- Tạo movie ID 1 nếu không tồn tại
INSERT IGNORE INTO movies (id, title, description, director, duration, genre, language, film_rating, price, rating, release_date, status, created_at, updated_at)
VALUES (1, 'Movie Placeholder', 'This is a placeholder movie for fixing reference errors', 'Unknown Director', 120, 'Action', 'Vietnamese', 'PG13', 50000, 7.0, '2024-01-01', 'NOW_SHOWING', NOW(), NOW());

-- Kiểm tra kết quả
SELECT 'Fix completed - Movie ID 1:' as info, id, title, status FROM movies WHERE id = 1;

-- Kiểm tra showtimes tham chiếu movie ID 1
SELECT 'Showtimes referencing movie ID 1:' as info, COUNT(*) as count FROM showtimes WHERE movie_id = 1;

-- Kiểm tra bookings tham chiếu movie ID 1
SELECT 'Bookings referencing movie ID 1:' as info, COUNT(*) as count 
FROM bookings b 
JOIN showtimes s ON b.showtime_id = s.id 
WHERE s.movie_id = 1;
"@

# Lưu script SQL
$fixSQL | Out-File -FilePath "auto_fix_movie.sql" -Encoding UTF8

Write-Host "📝 Created auto fix script: auto_fix_movie.sql" -ForegroundColor Green

# Thử chạy script
Write-Host "`n🔧 Executing fix script..." -ForegroundColor Blue
try {
    $sqlContent = Get-Content "auto_fix_movie.sql" -Raw
    $result = & $mysqlExe -u root -p123456 -e $sqlContent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Fix script executed successfully!" -ForegroundColor Green
        Write-Host "Result:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "⚠️ Script execution had issues, but may have worked" -ForegroundColor Yellow
        Write-Host "Output:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error executing script: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run manually: mysql -u root -p < auto_fix_movie.sql" -ForegroundColor Yellow
}

# Kiểm tra xem lỗi đã được sửa chưa
Write-Host "`n🔍 Testing if error is fixed..." -ForegroundColor Blue
try {
    $testResult = & $mysqlExe -u root -p123456 -e "USE movietickets; SELECT COUNT(*) as movie_count FROM movies WHERE id = 1;" 2>&1
    if ($testResult -match "movie_count.*1") {
        Write-Host "✅ Movie ID 1 now exists!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Movie ID 1 may still not exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Could not verify fix" -ForegroundColor Red
}

Write-Host "`n🌐 Next steps:" -ForegroundColor Blue
Write-Host "1. Restart your Spring Boot application" -ForegroundColor White
Write-Host "2. Test at: http://localhost:5173" -ForegroundColor White
Write-Host "3. Check application logs for any remaining errors" -ForegroundColor White

Write-Host "`n📋 If the error persists:" -ForegroundColor Yellow
Write-Host "1. Check if there are other missing movie references" -ForegroundColor White
Write-Host "2. Consider using the complete reset script" -ForegroundColor White
Write-Host "3. Check foreign key constraints" -ForegroundColor White

Write-Host "`n🏁 Auto-fix completed" -ForegroundColor Green
