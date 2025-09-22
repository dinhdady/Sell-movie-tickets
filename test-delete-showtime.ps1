# Script để test xóa showtime
param(
    [Parameter(Mandatory=$true)]
    [int]$ShowtimeId
)

Write-Host "🧪 Testing showtime deletion for ID: $ShowtimeId" -ForegroundColor Yellow

# 1. Kiểm tra showtime có tồn tại không
Write-Host "🔍 Checking if showtime exists..." -ForegroundColor Blue
try {
    $showtime = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId" -Method GET
    Write-Host "✅ Showtime found: $($showtime.data.startTime)" -ForegroundColor Green
} catch {
    Write-Host "❌ Showtime not found: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Kiểm tra có thể xóa không
Write-Host "🔍 Checking if showtime can be deleted..." -ForegroundColor Blue
try {
    $canDelete = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId/can-delete" -Method GET
    Write-Host "Can delete: $($canDelete.data.canDelete)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error checking deletion: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Thử xóa bình thường
Write-Host "🗑️  Attempting normal deletion..." -ForegroundColor Blue
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId" -Method DELETE
    Write-Host "✅ $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Normal deletion failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # 4. Thử xóa cascade
    Write-Host "🗑️  Attempting cascade deletion..." -ForegroundColor Blue
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId/cascade" -Method DELETE
        Write-Host "✅ $($result.message)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cascade deletion failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # 5. Thử xóa force
        Write-Host "🗑️  Attempting force deletion..." -ForegroundColor Blue
        try {
            $result = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId/force" -Method DELETE
            Write-Host "✅ $($result.message)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Force deletion failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "🏁 Test completed" -ForegroundColor Blue
