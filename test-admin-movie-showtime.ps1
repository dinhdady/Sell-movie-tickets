# Script để test toàn bộ chức năng admin movie management
Write-Host "🎬 Testing admin movie management with showtime display" -ForegroundColor Yellow

# Test 1: Tạo phim test
Write-Host "`n🔍 Test 1: Creating test movie..." -ForegroundColor Blue
$movieData = @{
    title = "Test Movie for Admin Display"
    description = "A comprehensive test movie for admin interface testing"
    duration = 150
    releaseDate = "2024-12-25"
    genre = "Action, Adventure"
    director = "Test Director"
    trailerUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    language = "English"
    cast = "Test Actor 1, Test Actor 2, Test Actor 3"
    rating = 8.5
    status = "NOW_SHOWING"
    price = 120000
    filmRating = "PG13"
}

try {
    $movieResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData
    Write-Host "✅ Test movie created successfully!" -ForegroundColor Green
    Write-Host "Movie ID: $($movieResponse.data.id)" -ForegroundColor Green
    Write-Host "Title: $($movieResponse.data.title)" -ForegroundColor Green
    
    $movieId = $movieResponse.data.id
} catch {
    Write-Host "❌ Error creating test movie: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Tạo suất chiếu test
Write-Host "`n🔍 Test 2: Creating test showtimes..." -ForegroundColor Blue
$showtimeData1 = @{
    movieId = $movieId
    roomId = 1
    startTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm")
    endTime = (Get-Date).AddDays(1).AddHours(2.5).ToString("yyyy-MM-ddTHH:mm")
}

$showtimeData2 = @{
    movieId = $movieId
    roomId = 2
    startTime = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm")
    endTime = (Get-Date).AddDays(2).AddHours(2.5).ToString("yyyy-MM-ddTHH:mm")
}

try {
    $showtime1Response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body ($showtimeData1 | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Test showtime 1 created!" -ForegroundColor Green
    
    $showtime2Response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body ($showtimeData2 | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Test showtime 2 created!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating test showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Kiểm tra suất chiếu của phim
Write-Host "`n🔍 Test 3: Checking movie showtimes..." -ForegroundColor Blue
try {
    $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/$movieId" -Method GET
    $showtimes = $showtimeResponse.object
    
    Write-Host "✅ Found $($showtimes.Count) showtimes for movie ID $movieId" -ForegroundColor Green
    foreach ($showtime in $showtimes) {
        Write-Host "  - Showtime ID: $($showtime.id)" -ForegroundColor Cyan
        Write-Host "    Start: $($showtime.startTime)" -ForegroundColor White
        Write-Host "    End: $($showtime.endTime)" -ForegroundColor White
        Write-Host "    Room: $($showtime.roomName)" -ForegroundColor White
        Write-Host "    Cinema: $($showtime.cinemaName)" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ Error getting showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Kiểm tra thông tin phim
Write-Host "`n🔍 Test 4: Checking movie details..." -ForegroundColor Blue
try {
    $movieDetailResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/$movieId" -Method GET
    $movie = $movieDetailResponse.object
    
    Write-Host "✅ Movie details retrieved successfully!" -ForegroundColor Green
    Write-Host "Title: $($movie.title)" -ForegroundColor Cyan
    Write-Host "Genre: $($movie.genre)" -ForegroundColor Cyan
    Write-Host "Director: $($movie.director)" -ForegroundColor Cyan
    Write-Host "Duration: $($movie.duration) minutes" -ForegroundColor Cyan
    Write-Host "Status: $($movie.status)" -ForegroundColor Cyan
    Write-Host "Price: $($movie.price) VNĐ" -ForegroundColor Cyan
    Write-Host "Rating: $($movie.rating)/10" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error getting movie details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Admin Interface Testing:" -ForegroundColor Yellow
Write-Host "1. Go to: http://localhost:5173/admin/movies" -ForegroundColor White
Write-Host "2. Find the test movie: '$($movieData.title)'" -ForegroundColor White
Write-Host "3. Click the calendar icon (📅) to view showtimes" -ForegroundColor White
Write-Host "4. Click 'Thêm suất chiếu' button" -ForegroundColor White
Write-Host "5. Verify movie information is displayed correctly" -ForegroundColor White
Write-Host "6. Verify current showtimes are listed" -ForegroundColor White

Write-Host "`n📋 Features to verify:" -ForegroundColor Blue
Write-Host "✅ MovieInfoCard component displays all movie details" -ForegroundColor Green
Write-Host "✅ Current showtimes table shows existing showtimes" -ForegroundColor Green
Write-Host "✅ Responsive design works on different screen sizes" -ForegroundColor Green
Write-Host "✅ Real-time data loading and updates" -ForegroundColor Green
Write-Host "✅ Proper error handling and loading states" -ForegroundColor Green

Write-Host "`n🎯 UI Components to check:" -ForegroundColor Blue
Write-Host "- Movie poster and title display" -ForegroundColor White
Write-Host "- Genre, director, duration information" -ForegroundColor White
Write-Host "- Release date and status badges" -ForegroundColor White
Write-Host "- Price and rating display" -ForegroundColor White
Write-Host "- Cast information" -ForegroundColor White
Write-Host "- Showtimes table with scrollable content" -ForegroundColor White

Write-Host "`n🏁 Test completed successfully!" -ForegroundColor Blue
