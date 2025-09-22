# Script để test các giá trị filmRating khác nhau
Write-Host "🧪 Testing FilmRating conversion" -ForegroundColor Yellow

# Test values
$testValues = @("G", "PG", "PG13", "PG-13", "PG_13", "PG 13", "R", "NC17", "NC-17", "NC_17", "NC 17", "INVALID")

foreach ($value in $testValues) {
    Write-Host "`n🔍 Testing value: '$value'" -ForegroundColor Blue
    
    $movieData = @{
        title = "Test Movie $value"
        description = "A test movie with rating $value"
        duration = 120
        releaseDate = "2024-12-25"
        genre = "Action"
        director = "Test Director"
        trailerUrl = "https://example.com/trailer"
        language = "English"
        cast = "Test Cast"
        rating = 8.5
        status = "NOW_SHOWING"
        price = 100000
        filmRating = $value
    }
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData
        Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
        Write-Host "  Converted to: $($response.data.filmRating)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "  Error details: $errorBody" -ForegroundColor Red
        }
    }
}

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
