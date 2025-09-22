# Script để xóa phim "Vua trở lại" khỏi database
Write-Host "🗑️ Deleting movie 'Vua trở lại' from database" -ForegroundColor Yellow

# Tìm phim "Vua trở lại"
Write-Host "🔍 Searching for movie 'Vua trở lại'..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie" -Method GET
    $movies = $response.movies
    
    $targetMovie = $movies | Where-Object { $_.title -eq "Vua trở lại" }
    
    if ($targetMovie) {
        Write-Host "✅ Found movie: $($targetMovie.title) (ID: $($targetMovie.id))" -ForegroundColor Green
        
        # Xóa phim
        Write-Host "🗑️ Deleting movie..." -ForegroundColor Blue
        try {
            $deleteResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/$($targetMovie.id)" -Method DELETE
            Write-Host "✅ Successfully deleted movie: $($deleteResponse.message)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error deleting movie: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Error details: $errorBody" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "ℹ️ Movie 'Vua trở lại' not found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error searching for movies: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Script completed" -ForegroundColor Blue
