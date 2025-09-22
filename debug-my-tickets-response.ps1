# Debug script to check my-tickets API response structure
Write-Host "🔍 Debug My Tickets API Response" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`nTesting my-tickets API to see actual response structure..." -ForegroundColor Green

$baseUrl = "http://localhost:8080/api"
$userId = "1"  # Test with user ID 1

try {
    Write-Host "`nCalling: GET $baseUrl/tickets/my-tickets?userId=$userId" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/my-tickets?userId=$userId" -Method GET
    
    Write-Host "✅ API Response received" -ForegroundColor Green
    Write-Host "Status: $($response.state)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Data count: $($response.object.Count)" -ForegroundColor White
    
    if ($response.object.Count -gt 0) {
        $ticket = $response.object[0]
        Write-Host "`n📋 Sample ticket structure:" -ForegroundColor Yellow
        Write-Host "=========================" -ForegroundColor Yellow
        
        # Display all properties
        $ticket.PSObject.Properties | ForEach-Object {
            $value = $_.Value
            if ($value -eq $null) {
                $value = "NULL"
            } elseif ($value -eq "") {
                $value = "EMPTY_STRING"
            }
            Write-Host "$($_.Name): $value" -ForegroundColor White
        }
        
        Write-Host "`n🔍 Key properties check:" -ForegroundColor Cyan
        Write-Host "=======================" -ForegroundColor Cyan
        Write-Host "id: $($ticket.id)" -ForegroundColor White
        Write-Host "status: $($ticket.status)" -ForegroundColor White
        Write-Host "token: $($ticket.token)" -ForegroundColor White
        Write-Host "price: $($ticket.price)" -ForegroundColor White
        Write-Host "customerEmail: $($ticket.customerEmail)" -ForegroundColor White
        Write-Host "movieTitle: $($ticket.movieTitle)" -ForegroundColor White
        
        # Check if status exists in different possible locations
        Write-Host "`n🔍 Status field variations:" -ForegroundColor Magenta
        Write-Host "===========================" -ForegroundColor Magenta
        Write-Host "ticket.status: $($ticket.status)" -ForegroundColor White
        Write-Host "ticket.paymentStatus: $($ticket.paymentStatus)" -ForegroundColor White
        Write-Host "ticket.ticketStatus: $($ticket.ticketStatus)" -ForegroundColor White
        Write-Host "ticket.orderStatus: $($ticket.orderStatus)" -ForegroundColor White
        
        # Check nested objects
        if ($ticket.order) {
            Write-Host "`n🔍 Order object:" -ForegroundColor Blue
            Write-Host "===============" -ForegroundColor Blue
            $ticket.order.PSObject.Properties | ForEach-Object {
                Write-Host "order.$($_.Name): $($_.Value)" -ForegroundColor White
            }
        }
        
    } else {
        Write-Host "⚠️ No tickets found for user $userId" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`nExpected MyTicketResponse structure:" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "• id: number" -ForegroundColor White
Write-Host "• token: string" -ForegroundColor White
Write-Host "• price: number" -ForegroundColor White
Write-Host "• status: string (PENDING/PAID/USED)" -ForegroundColor White
Write-Host "• customerEmail: string" -ForegroundColor White
Write-Host "• movieTitle: string" -ForegroundColor White
Write-Host "• seatNumber: string" -ForegroundColor White
Write-Host "• createdAt: string" -ForegroundColor White
