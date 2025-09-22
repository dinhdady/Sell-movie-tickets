# Script để kiểm tra trạng thái database
Write-Host "🔍 Checking database status" -ForegroundColor Yellow

# Kiểm tra phim
Write-Host "`n📽️ Movies:" -ForegroundColor Blue
try {
    $movieResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/movie" -Method GET
    Write-Host "Total movies: $($movieResponse.totalItems)" -ForegroundColor Cyan
    if ($movieResponse.movies.Count -gt 0) {
        foreach ($movie in $movieResponse.movies) {
            Write-Host "  - $($movie.title) (ID: $($movie.id), Status: $($movie.status))" -ForegroundColor Green
        }
    } else {
        Write-Host "  No movies found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error getting movies: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra rạp chiếu
Write-Host "`n🏢 Cinemas:" -ForegroundColor Blue
try {
    $cinemaResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/cinema" -Method GET
    Write-Host "Total cinemas: $($cinemaResponse.data.Count)" -ForegroundColor Cyan
    foreach ($cinema in $cinemaResponse.data) {
        Write-Host "  - $($cinema.name) (ID: $($cinema.id))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error getting cinemas: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra phòng chiếu
Write-Host "`n🎬 Rooms:" -ForegroundColor Blue
try {
    $roomResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/room" -Method GET
    Write-Host "Total rooms: $($roomResponse.data.Count)" -ForegroundColor Cyan
    foreach ($room in $roomResponse.data) {
        Write-Host "  - $($room.name) (ID: $($room.id), Cinema: $($room.cinemaName))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error getting rooms: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra suất chiếu
Write-Host "`n⏰ Showtimes:" -ForegroundColor Blue
try {
    $showtimeResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method GET
    Write-Host "Total showtimes: $($showtimeResponse.data.Count)" -ForegroundColor Cyan
    if ($showtimeResponse.data.Count -gt 0) {
        foreach ($showtime in $showtimeResponse.data) {
            Write-Host "  - Movie ID: $($showtime.movieId), Room: $($showtime.roomName), Time: $($showtime.startTime)" -ForegroundColor Green
        }
    } else {
        Write-Host "  No showtimes found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error getting showtimes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Database status check completed" -ForegroundColor Blue
