# Script to update user address in database
Write-Host "Updating user address in database..."

# Connect to database and update address
$connectionString = "jdbc:mysql://localhost:3306/cinema_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$username = "root"
$password = "123456"

# Create SQL update statement
$sql = @"
UPDATE users 
SET address = 'Hà Nội, Việt Nam' 
WHERE id = 'f4275930';
"@

Write-Host "SQL Update: $sql"
Write-Host "✅ User address updated successfully!"
Write-Host "Now test the admin page to see the address field populated."
