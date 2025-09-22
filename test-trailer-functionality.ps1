# Script để test chức năng trailer
Write-Host "🎬 Testing trailer functionality" -ForegroundColor Yellow

# Test data với trailer URL
$movieData = @{
    title = "Test Movie with Trailer"
    description = "A test movie with YouTube trailer"
    duration = 120
    releaseDate = "2024-12-25"
    genre = "Action"
    director = "Test Director"
    trailerUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    language = "English"
    cast = "Test Cast"
    rating = 8.5
    status = "NOW_SHOWING"
    price = 100000
    filmRating = "PG13"
}

Write-Host "📝 Movie data with trailer URL:" -ForegroundColor Blue
$movieData.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Cyan }

# Test 1: Tạo movie với trailer URL
Write-Host "`n🔍 Test 1: Creating movie with trailer URL" -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response.data.id)" -ForegroundColor Green
    Write-Host "Trailer URL: $($response.data.trailerUrl)" -ForegroundColor Green
    
    $movieId = $response.data.id
    Write-Host "`n🌐 You can test the trailer at: http://localhost:5173/movies/$movieId" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Test với trailer URL khác
Write-Host "`n🔍 Test 2: Creating movie with different trailer URL" -ForegroundColor Blue
$movieData2 = $movieData.Clone()
$movieData2["title"] = "Test Movie 2 with Trailer"
$movieData2["trailerUrl"] = "https://youtu.be/9bZkp7q19f0"

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData2
    Write-Host "✅ Success: $($response2.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response2.data.id)" -ForegroundColor Green
    Write-Host "Trailer URL: $($response2.data.trailerUrl)" -ForegroundColor Green
    
    $movieId2 = $response2.data.id
    Write-Host "`n🌐 You can test the trailer at: http://localhost:5173/movies/$movieId2" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test với trailer URL không hợp lệ
Write-Host "`n🔍 Test 3: Creating movie with invalid trailer URL" -ForegroundColor Blue
$movieData3 = $movieData.Clone()
$movieData3["title"] = "Test Movie 3 with Invalid Trailer"
$movieData3["trailerUrl"] = "https://example.com/not-youtube"

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData3
    Write-Host "✅ Success: $($response3.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response3.data.id)" -ForegroundColor Green
    Write-Host "Trailer URL: $($response3.data.trailerUrl)" -ForegroundColor Green
    
    $movieId3 = $response3.data.id
    Write-Host "`n🌐 You can test the invalid trailer at: http://localhost:5173/movies/$movieId3" -ForegroundColor Yellow
    Write-Host "   (Should show error message in modal)" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Test Summary:" -ForegroundColor Blue
Write-Host "1. Movie with valid YouTube trailer URL" -ForegroundColor Cyan
Write-Host "2. Movie with different YouTube trailer URL" -ForegroundColor Cyan
Write-Host "3. Movie with invalid trailer URL (should show error)" -ForegroundColor Cyan

Write-Host "`n🎯 Features to test in browser:" -ForegroundColor Yellow
Write-Host "- Click 'Xem trailer' button to open modal" -ForegroundColor White
Write-Host "- Video should autoplay when modal opens" -ForegroundColor White
Write-Host "- Press ESC or click outside to close modal" -ForegroundColor White
Write-Host "- Invalid URLs should show error message" -ForegroundColor White

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
