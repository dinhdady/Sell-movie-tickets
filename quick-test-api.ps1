# Quick API test
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/tickets/test" -Method GET
Write-Host "Total tickets: $($response.object.Count)"
$emails = $response.object | ForEach-Object { $_.customerEmail } | Sort-Object | Get-Unique
Write-Host "Unique emails: $($emails -join ', ')"
