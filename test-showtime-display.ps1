# Script để test hiển thị thông tin suất chiếu trong admin
Write-Host "🎬 Testing showtime display in admin movie management" -ForegroundColor Yellow

# Lấy danh sách phim
Write-Host "🔍 Getting movies list..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie" -Method GET
    $movies = $response.movies
    
    if ($movies.Count -gt 0) {
        Write-Host "✅ Found $($movies.Count) movies" -ForegroundColor Green
        
        # Lấy phim đầu tiên để test
        $testMovie = $movies[0]
        Write-Host "`n📽️ Testing with movie: $($testMovie.title) (ID: $($testMovie.id))" -ForegroundColor Cyan
        
        # Lấy suất chiếu của phim này
        Write-Host "🔍 Getting showtimes for movie ID $($testMovie.id)..." -ForegroundColor Blue
        try {
            $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/$($testMovie.id)" -Method GET
            $showtimes = $showtimeResponse.object
            
            if ($showtimes.Count -gt 0) {
                Write-Host "✅ Found $($showtimes.Count) showtimes for this movie" -ForegroundColor Green
                Write-Host "`n📋 Showtimes details:" -ForegroundColor Blue
                foreach ($showtime in $showtimes) {
                    Write-Host "  - ID: $($showtime.id)" -ForegroundColor Cyan
                    Write-Host "    Start: $($showtime.startTime)" -ForegroundColor White
                    Write-Host "    End: $($showtime.endTime)" -ForegroundColor White
                    Write-Host "    Room: $($showtime.roomName)" -ForegroundColor White
                    Write-Host "    Cinema: $($showtime.cinemaName)" -ForegroundColor White
                    Write-Host ""
                }
            } else {
                Write-Host "⚠️ No showtimes found for this movie" -ForegroundColor Yellow
                Write-Host "Let's create a test showtime..." -ForegroundColor Blue
                
                # Tạo suất chiếu test
                $showtimeData = @{
                    movieId = $testMovie.id
                    roomId = 1
                    startTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm")
                    endTime = (Get-Date).AddDays(1).AddHours(2).ToString("yyyy-MM-ddTHH:mm")
                }
                
                try {
                    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body ($showtimeData | ConvertTo-Json) -ContentType "application/json"
                    Write-Host "✅ Test showtime created successfully!" -ForegroundColor Green
                    Write-Host "Showtime ID: $($createResponse.object.id)" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Error creating test showtime: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "❌ Error getting showtimes: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host "`n🌐 You can test the admin interface at: http://localhost:5173/admin/movies" -ForegroundColor Yellow
        Write-Host "`n🎯 Steps to test:" -ForegroundColor Blue
        Write-Host "1. Go to admin movies page" -ForegroundColor White
        Write-Host "2. Click the calendar icon (📅) next to a movie" -ForegroundColor White
        Write-Host "3. Click 'Thêm suất chiếu' button" -ForegroundColor White
        Write-Host "4. Check if movie information is displayed" -ForegroundColor White
        Write-Host "5. Check if current showtimes are listed" -ForegroundColor White
        
    } else {
        Write-Host "❌ No movies found" -ForegroundColor Red
        Write-Host "Let's create a test movie first..." -ForegroundColor Blue
        
        $movieData = @{
            title = "Test Movie for Showtime Display"
            description = "A test movie for testing showtime display functionality"
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
        
        try {
            $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData
            Write-Host "✅ Test movie created with ID: $($createResponse.data.id)" -ForegroundColor Green
            Write-Host "🌐 You can now test at: http://localhost:5173/admin/movies" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Error creating test movie: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Error getting movies: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Features to verify in admin interface:" -ForegroundColor Blue
Write-Host "✅ Movie information display in add showtime modal" -ForegroundColor Green
Write-Host "✅ Current showtimes list with details" -ForegroundColor Green
Write-Host "✅ Responsive design and proper formatting" -ForegroundColor Green
Write-Host "✅ Real-time data loading" -ForegroundColor Green

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
