# Script để xóa showtime an toàn
param(
    [Parameter(Mandatory=$true)]
    [int]$ShowtimeId
)

Write-Host "🗑️  Deleting showtime ID: $ShowtimeId" -ForegroundColor Yellow

# Kiểm tra xem có booking nào không
Write-Host "🔍 Checking for associated bookings..." -ForegroundColor Blue
$bookings = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId/can-delete" -Method GET
Write-Host "Can delete: $($bookings.data.canDelete)" -ForegroundColor Cyan

if ($bookings.data.canDelete -eq $false) {
    Write-Host "❌ Cannot delete showtime - has associated bookings" -ForegroundColor Red
    Write-Host "Use force delete to remove all related data" -ForegroundColor Yellow
    
    $confirm = Read-Host "Do you want to force delete? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host "🚨 Force deleting showtime and all related data..." -ForegroundColor Red
        try {
            $result = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId/force" -Method DELETE
            Write-Host "✅ $($result.message)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Deletion cancelled" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Safe to delete showtime" -ForegroundColor Green
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/$ShowtimeId" -Method DELETE
        Write-Host "✅ $($result.message)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🏁 Script completed" -ForegroundColor Blue
