# Script để reset tất cả phim trong database
Write-Host "🔄 Resetting all movies in database" -ForegroundColor Yellow

# Lấy danh sách tất cả phim
Write-Host "🔍 Getting all movies..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie" -Method GET
    $movies = $response.movies
    
    Write-Host "📋 Found $($movies.Count) movies:" -ForegroundColor Blue
    foreach ($movie in $movies) {
        Write-Host "  - $($movie.title) (ID: $($movie.id))" -ForegroundColor Cyan
    }
    
    if ($movies.Count -gt 0) {
        Write-Host "`n🗑️ Deleting all movies..." -ForegroundColor Blue
        
        foreach ($movie in $movies) {
            try {
                Write-Host "Deleting: $($movie.title)..." -ForegroundColor Yellow
                $deleteResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/$($movie.id)" -Method DELETE
                Write-Host "✅ Deleted: $($movie.title)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error deleting $($movie.title): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host "`n✅ All movies deleted successfully!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No movies found in database" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error getting movies: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Reset completed" -ForegroundColor Blue
