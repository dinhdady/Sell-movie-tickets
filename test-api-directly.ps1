Write-Host "=== TESTING API DIRECTLY ==="

Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 30

Write-Host "=== TESTING SHOWTIME FILTERING ==="
Write-Host "Current Date/Time: $(Get-Date)"
Write-Host ""

Write-Host "1. Testing debug endpoint to see all showtimes:"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/debug/all" -Method Get
    Write-Host "Debug endpoint response:"
    Write-Host "Current Time: $($response.data.currentTime)"
    Write-Host "Total Showtimes: $($response.data.totalShowtimes)"
    Write-Host ""
    Write-Host "Showtimes:"
    foreach ($showtime in $response.data.showtimes) {
        Write-Host "  ID: $($showtime.id), StartTime: $($showtime.startTime), EndTime: $($showtime.endTime), IsExpired: $($showtime.isExpired)"
    }
} catch {
    Write-Host "Error calling debug endpoint: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "2. Testing filtered movie showtimes:"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/1/showtimes" -Method Get
    Write-Host "Filtered movie showtimes response:"
    Write-Host "Status: $($response.status)"
    Write-Host "Message: $($response.message)"
    Write-Host "Data count: $($response.data.Count)"
    Write-Host ""
    foreach ($showtime in $response.data) {
        Write-Host "  ID: $($showtime.id), StartTime: $($showtime.startTime), EndTime: $($showtime.endTime)"
    }
} catch {
    Write-Host "Error calling movie showtimes endpoint: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "3. Testing filtered showtime by movie:"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime/movie/1" -Method Get
    Write-Host "Filtered showtime by movie response:"
    Write-Host "Status: $($response.status)"
    Write-Host "Message: $($response.message)"
    Write-Host "Data count: $($response.data.Count)"
    Write-Host ""
    foreach ($showtime in $response.data) {
        Write-Host "  ID: $($showtime.id), StartTime: $($showtime.startTime), EndTime: $($showtime.endTime)"
    }
} catch {
    Write-Host "Error calling showtime by movie endpoint: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== ANALYSIS ==="
Write-Host "Compare the results:"
Write-Host "- Debug endpoint shows ALL showtimes (including expired)"
Write-Host "- Filtered endpoints should show ONLY active showtimes"
Write-Host "- If counts are the same, filtering is not working"
Write-Host "- If filtered count is less, filtering is working"
Write-Host ""

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
