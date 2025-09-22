# Script để test cụ thể với phim "TỬ CHIẾN TRÊN KHÔNG"
Write-Host "🎬 Testing showtime display for 'TỬ CHIẾN TRÊN KHÔNG'" -ForegroundColor Yellow

# Tìm phim "TỬ CHIẾN TRÊN KHÔNG"
Write-Host "🔍 Searching for movie 'TỬ CHIẾN TRÊN KHÔNG'..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie" -Method GET
    $movies = $response.movies
    
    $targetMovie = $movies | Where-Object { $_.title -like "*TỬ CHIẾN TRÊN KHÔNG*" -or $_.title -like "*TỬ CHIẾN*" }
    
    if ($targetMovie) {
        Write-Host "✅ Found movie: $($targetMovie.title) (ID: $($targetMovie.id))" -ForegroundColor Green
        
        # Test API showtime cho phim này
        Write-Host "`n🔍 Testing showtime API for movie ID $($targetMovie.id)..." -ForegroundColor Blue
        try {
            $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/$($targetMovie.id)" -Method GET
            Write-Host "✅ Showtime API response received" -ForegroundColor Green
            Write-Host "Response state: $($showtimeResponse.state)" -ForegroundColor Cyan
            Write-Host "Response message: $($showtimeResponse.message)" -ForegroundColor Cyan
            
            if ($showtimeResponse.object) {
                $showtimes = $showtimeResponse.object
                Write-Host "Found $($showtimes.Count) showtimes for this movie:" -ForegroundColor Green
                foreach ($showtime in $showtimes) {
                    Write-Host "  - Showtime ID: $($showtime.id)" -ForegroundColor White
                    Write-Host "    Start: $($showtime.startTime)" -ForegroundColor White
                    Write-Host "    End: $($showtime.endTime)" -ForegroundColor White
                    Write-Host "    Room: $($showtime.roomName)" -ForegroundColor White
                    Write-Host "    Cinema: $($showtime.cinemaName)" -ForegroundColor White
                    Write-Host ""
                }
            } else {
                Write-Host "⚠️ No showtimes found in response object" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Error calling showtime API: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Tạo suất chiếu test nếu chưa có
        if ($showtimes.Count -eq 0) {
            Write-Host "`n🔍 Creating test showtime for this movie..." -ForegroundColor Blue
            $showtimeData = @{
                movieId = $targetMovie.id
                roomId = 1
                startTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm")
                endTime = (Get-Date).AddDays(1).AddHours(2).ToString("yyyy-MM-ddTHH:mm")
            }
            
            try {
                $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body ($showtimeData | ConvertTo-Json) -ContentType "application/json"
                Write-Host "✅ Test showtime created successfully!" -ForegroundColor Green
                Write-Host "Showtime ID: $($createResponse.object.id)" -ForegroundColor Green
                
                # Test lại API sau khi tạo
                Write-Host "`n🔍 Testing showtime API again after creation..." -ForegroundColor Blue
                $showtimeResponse2 = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/$($targetMovie.id)" -Method GET
                Write-Host "Found $($showtimeResponse2.object.Count) showtimes after creation" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error creating showtime: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host "`n🌐 Test admin interface at: http://localhost:5173/admin/movies" -ForegroundColor Yellow
        Write-Host "`n🎯 Steps to test:" -ForegroundColor Blue
        Write-Host "1. Go to admin movies page" -ForegroundColor White
        Write-Host "2. Find movie: '$($targetMovie.title)'" -ForegroundColor White
        Write-Host "3. Click calendar icon (📅) to view showtimes" -ForegroundColor White
        Write-Host "4. Check if showtimes are displayed correctly" -ForegroundColor White
        Write-Host "5. Click 'Thêm suất chiếu' button" -ForegroundColor White
        Write-Host "6. Check if current showtimes are listed in the modal" -ForegroundColor White
        
    } else {
        Write-Host "❌ Movie 'TỬ CHIẾN TRÊN KHÔNG' not found" -ForegroundColor Red
        Write-Host "Available movies:" -ForegroundColor Yellow
        foreach ($movie in $movies) {
            Write-Host "  - $($movie.title) (ID: $($movie.id))" -ForegroundColor White
        }
        
        # Tạo phim test
        Write-Host "`n🔍 Creating test movie 'TỬ CHIẾN TRÊN KHÔNG'..." -ForegroundColor Blue
        $movieData = @{
            title = "TỬ CHIẾN TRÊN KHÔNG"
            description = "Một bộ phim hành động đầy kịch tính"
            duration = 120
            releaseDate = "2024-12-25"
            genre = "Hành động"
            director = "Test Director"
            trailerUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            language = "Tiếng Việt"
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

Write-Host "`n📋 Debug checklist:" -ForegroundColor Blue
Write-Host "✅ Check browser console for debug logs" -ForegroundColor Green
Write-Host "✅ Verify API response format" -ForegroundColor Green
Write-Host "✅ Check showtimes state in React component" -ForegroundColor Green
Write-Host "✅ Verify modal display logic" -ForegroundColor Green

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
