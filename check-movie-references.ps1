# Script để kiểm tra tham chiếu Movie trong database
Write-Host "🔍 Checking Movie references in database..." -ForegroundColor Yellow

# Kết nối MySQL và kiểm tra
$connectionString = "Server=localhost;Database=movietickets;Uid=root;Pwd=123456;"

try {
    # Load MySQL connector
    Add-Type -Path "C:\Program Files (x86)\MySQL\MySQL Connector Net 8.0.33\Assemblies\v4.5.2\MySql.Data.dll"
    
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "✅ Connected to database successfully" -ForegroundColor Green
    
    # 1. Kiểm tra movies table
    Write-Host "`n📊 Checking movies table..." -ForegroundColor Blue
    $movieQuery = "SELECT COUNT(*) as movie_count FROM movies"
    $movieCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($movieQuery, $connection)
    $movieReader = $movieCommand.ExecuteReader()
    $movieReader.Read()
    $movieCount = $movieReader["movie_count"]
    $movieReader.Close()
    Write-Host "Total movies: $movieCount" -ForegroundColor Cyan
    
    if ($movieCount -gt 0) {
        $movieListQuery = "SELECT id, title, status FROM movies ORDER BY id LIMIT 10"
        $movieListCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($movieListQuery, $connection)
        $movieListReader = $movieListCommand.ExecuteReader()
        Write-Host "`nMovies in database:" -ForegroundColor Cyan
        while ($movieListReader.Read()) {
            Write-Host "  ID: $($movieListReader['id']) - $($movieListReader['title']) - Status: $($movieListReader['status'])" -ForegroundColor White
        }
        $movieListReader.Close()
    }
    
    # 2. Kiểm tra showtimes table
    Write-Host "`n📊 Checking showtimes table..." -ForegroundColor Blue
    $showtimeQuery = "SELECT COUNT(*) as showtime_count FROM showtimes"
    $showtimeCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($showtimeQuery, $connection)
    $showtimeReader = $showtimeCommand.ExecuteReader()
    $showtimeReader.Read()
    $showtimeCount = $showtimeReader["showtime_count"]
    $showtimeReader.Close()
    Write-Host "Total showtimes: $showtimeCount" -ForegroundColor Cyan
    
    # 3. Kiểm tra orphaned showtimes (showtimes tham chiếu movie không tồn tại)
    Write-Host "`n🔍 Checking for orphaned showtimes..." -ForegroundColor Blue
    $orphanedShowtimeQuery = @"
SELECT s.id, s.movie_id, s.start_time, s.end_time
FROM showtimes s 
LEFT JOIN movies m ON s.movie_id = m.id 
WHERE m.id IS NULL
"@
    $orphanedShowtimeCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($orphanedShowtimeQuery, $connection)
    $orphanedShowtimeReader = $orphanedShowtimeCommand.ExecuteReader()
    
    $orphanedShowtimes = @()
    while ($orphanedShowtimeReader.Read()) {
        $orphanedShowtimes += @{
            id = $orphanedShowtimeReader["id"]
            movie_id = $orphanedShowtimeReader["movie_id"]
            start_time = $orphanedShowtimeReader["start_time"]
            end_time = $orphanedShowtimeReader["end_time"]
        }
    }
    $orphanedShowtimeReader.Close()
    
    if ($orphanedShowtimes.Count -gt 0) {
        Write-Host "❌ Found $($orphanedShowtimes.Count) orphaned showtimes:" -ForegroundColor Red
        foreach ($showtime in $orphanedShowtimes) {
            Write-Host "  Showtime ID: $($showtime.id) - Movie ID: $($showtime.movie_id) - Time: $($showtime.start_time)" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ No orphaned showtimes found" -ForegroundColor Green
    }
    
    # 4. Kiểm tra bookings table
    Write-Host "`n📊 Checking bookings table..." -ForegroundColor Blue
    $bookingQuery = "SELECT COUNT(*) as booking_count FROM bookings"
    $bookingCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($bookingQuery, $connection)
    $bookingReader = $bookingCommand.ExecuteReader()
    $bookingReader.Read()
    $bookingCount = $bookingReader["booking_count"]
    $bookingReader.Close()
    Write-Host "Total bookings: $bookingCount" -ForegroundColor Cyan
    
    # 5. Kiểm tra orphaned bookings
    Write-Host "`n🔍 Checking for orphaned bookings..." -ForegroundColor Blue
    $orphanedBookingQuery = @"
SELECT b.id, b.showtime_id, b.customer_name, b.customer_email, b.created_at
FROM bookings b 
LEFT JOIN showtimes s ON b.showtime_id = s.id 
LEFT JOIN movies m ON s.movie_id = m.id
WHERE m.id IS NULL
"@
    $orphanedBookingCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($orphanedBookingQuery, $connection)
    $orphanedBookingReader = $orphanedBookingCommand.ExecuteReader()
    
    $orphanedBookings = @()
    while ($orphanedBookingReader.Read()) {
        $orphanedBookings += @{
            id = $orphanedBookingReader["id"]
            showtime_id = $orphanedBookingReader["showtime_id"]
            customer_name = $orphanedBookingReader["customer_name"]
            customer_email = $orphanedBookingReader["customer_email"]
            created_at = $orphanedBookingReader["created_at"]
        }
    }
    $orphanedBookingReader.Close()
    
    if ($orphanedBookings.Count -gt 0) {
        Write-Host "❌ Found $($orphanedBookings.Count) orphaned bookings:" -ForegroundColor Red
        foreach ($booking in $orphanedBookings) {
            Write-Host "  Booking ID: $($booking.id) - Showtime ID: $($booking.showtime_id) - Customer: $($booking.customer_name)" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ No orphaned bookings found" -ForegroundColor Green
    }
    
    # 6. Kiểm tra movie ID 1 cụ thể
    Write-Host "`n🔍 Checking specific movie ID 1..." -ForegroundColor Blue
    $movie1Query = "SELECT id, title, status FROM movies WHERE id = 1"
    $movie1Command = New-Object MySql.Data.MySqlClient.MySqlCommand($movie1Query, $connection)
    $movie1Reader = $movie1Command.ExecuteReader()
    
    if ($movie1Reader.Read()) {
        Write-Host "✅ Movie ID 1 exists: $($movie1Reader['title']) - Status: $($movie1Reader['status'])" -ForegroundColor Green
    } else {
        Write-Host "❌ Movie ID 1 does not exist!" -ForegroundColor Red
        
        # Tìm showtimes tham chiếu movie ID 1
        $movie1ShowtimeQuery = "SELECT id, movie_id, start_time, end_time FROM showtimes WHERE movie_id = 1"
        $movie1ShowtimeCommand = New-Object MySql.Data.MySqlClient.MySqlCommand($movie1ShowtimeQuery, $connection)
        $movie1ShowtimeReader = $movie1ShowtimeCommand.ExecuteReader()
        
        $movie1Showtimes = @()
        while ($movie1ShowtimeReader.Read()) {
            $movie1Showtimes += @{
                id = $movie1ShowtimeReader["id"]
                movie_id = $movie1ShowtimeReader["movie_id"]
                start_time = $movie1ShowtimeReader["start_time"]
                end_time = $movie1ShowtimeReader["end_time"]
            }
        }
        $movie1ShowtimeReader.Close()
        
        if ($movie1Showtimes.Count -gt 0) {
            Write-Host "Found $($movie1Showtimes.Count) showtimes referencing movie ID 1:" -ForegroundColor Yellow
            foreach ($showtime in $movie1Showtimes) {
                Write-Host "  Showtime ID: $($showtime.id) - Time: $($showtime.start_time)" -ForegroundColor Yellow
            }
        }
    }
    $movie1Reader.Close()
    
    $connection.Close()
    
} catch {
    Write-Host "❌ Database connection error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Fallback: Sử dụng PowerShell với MySQL command line
    try {
        Write-Host "`nTrying MySQL command line..." -ForegroundColor Blue
        $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        if (Test-Path $mysqlPath) {
            $query = "USE movietickets; SELECT COUNT(*) as movie_count FROM movies; SELECT id, title FROM movies LIMIT 5;"
            $result = & $mysqlPath -u root -p123456 -e $query
            Write-Host "MySQL query result:" -ForegroundColor Cyan
            Write-Host $result -ForegroundColor White
        } else {
            Write-Host "MySQL command line not found at: $mysqlPath" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Alternative method also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🔧 Recommended actions:" -ForegroundColor Blue
Write-Host "1. If orphaned data found, clean it up" -ForegroundColor White
Write-Host "2. If movie ID 1 missing, create it or update references" -ForegroundColor White
Write-Host "3. Check application logs for more details" -ForegroundColor White
Write-Host "4. Consider adding foreign key constraints" -ForegroundColor White

Write-Host "`n🏁 Database check completed" -ForegroundColor Blue
