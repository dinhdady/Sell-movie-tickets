# Script để test thêm movie
Write-Host "🧪 Testing add movie functionality" -ForegroundColor Yellow

# Test data
$movieData = @{
    title = "Test Movie"
    description = "A test movie description"
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
    filmRating = "PG13"
}

Write-Host "📝 Movie data:" -ForegroundColor Blue
$movieData.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Cyan }

# Create form data
$formData = @{}
foreach ($key in $movieData.Keys) {
    $formData[$key] = $movieData[$key]
}

# Test 1: Test with PG13
Write-Host "`n🔍 Test 1: Adding movie with PG13 rating" -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $formData
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response.data.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Test with PG-13
Write-Host "`n🔍 Test 2: Adding movie with PG-13 rating" -ForegroundColor Blue
$formData["filmRating"] = "PG-13"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $formData
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response.data.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 3: Test with invalid rating
Write-Host "`n🔍 Test 3: Adding movie with invalid rating" -ForegroundColor Blue
$formData["filmRating"] = "INVALID"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $formData
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response.data.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
