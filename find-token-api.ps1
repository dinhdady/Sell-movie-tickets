# Script to find token in all APIs
Write-Host "Finding token in all APIs..." -ForegroundColor Green

$baseUrl = "http://localhost:8080/api"
$endpoints = @(
    "/tickets/test",
    "/tickets",
    "/booking",
    "/admin/bookings",
    "/test/bookings"
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting $endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method GET
        Write-Host "Status: Success" -ForegroundColor Green
        
        # Check for token in response
        $responseJson = $response | ConvertTo-Json -Depth 10
        if ($responseJson -match "token") {
            Write-Host "Found token in response!" -ForegroundColor Green
            # Extract token values
            $tokens = [regex]::Matches($responseJson, '"token"\s*:\s*"([^"]+)"')
            foreach ($match in $tokens) {
                Write-Host "Token: $($match.Groups[1].Value)" -ForegroundColor White
            }
        } else {
            Write-Host "No token found" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
