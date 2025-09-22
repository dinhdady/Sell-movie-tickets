# Script to add sample showtimes to database
Write-Host "Adding sample showtimes to database..."

# Sample showtime data
$showtimeData = @"
{
  "movieId": 7,
  "roomId": 1,
  "startTime": "2025-01-25T10:00:00",
  "endTime": "2025-01-25T12:00:00"
}
"@

$showtimeData2 = @"
{
  "movieId": 7,
  "roomId": 1,
  "startTime": "2025-01-25T14:00:00",
  "endTime": "2025-01-25T16:00:00"
}
"@

$showtimeData3 = @"
{
  "movieId": 7,
  "roomId": 1,
  "startTime": "2025-01-25T18:00:00",
  "endTime": "2025-01-25T20:00:00"
}
"@

Write-Host "Creating showtime 1..."
try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body $showtimeData -ContentType "application/json" -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW5oMTIzMyIsInJvbGUiOiJST0xFX0FETUlOIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6Im1vdmllIiwiaWF0IjoxNzU4NTUzMTE3LCJleHAiOjE3NTg1NTY3MTd9.qaYeEXeVRvqziQNLoD5BTdyJ8-VzfJyaX_6T8DQHvsA"}
    Write-Host "✅ Showtime 1 created: $($response1.message)"
} catch {
    Write-Host "❌ Error creating showtime 1: $($_.Exception.Message)"
}

Write-Host "Creating showtime 2..."
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body $showtimeData2 -ContentType "application/json" -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW5oMTIzMyIsInJvbGUiOiJST0xFX0FETUlOIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6Im1vdmllIiwiaWF0IjoxNzU4NTUzMTE3LCJleHAiOjE3NTg1NTY3MTd9.qaYeEXeVRvqziQNLoD5BTdyJ8-VzfJyaX_6T8DQHvsA"}
    Write-Host "✅ Showtime 2 created: $($response2.message)"
} catch {
    Write-Host "❌ Error creating showtime 2: $($_.Exception.Message)"
}

Write-Host "Creating showtime 3..."
try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8080/api/showtime" -Method POST -Body $showtimeData3 -ContentType "application/json" -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW5oMTIzMyIsInJvbGUiOiJST0xFX0FETUlOIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6Im1vdmllIiwiaWF0IjoxNzU4NTUzMTE3LCJleHAiOjE3NTg1NTY3MTd9.qaYeEXeVRvqziQNLoD5BTdyJ8-VzfJyaX_6T8DQHvsA"}
    Write-Host "✅ Showtime 3 created: $($response3.message)"
} catch {
    Write-Host "❌ Error creating showtime 3: $($_.Exception.Message)"
}

Write-Host "✅ Sample showtimes added successfully!"
Write-Host "Now test the cinema page to see showtimes."
