# Test login script to debug authentication issues

$baseUrl = "http://localhost:5295"

Write-Host "Testing login endpoints..." -ForegroundColor Yellow

# Test 1: Check if backend is running
Write-Host "`n1. Testing backend connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend is reachable" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not reachable at $baseUrl" -ForegroundColor Red
    Write-Host "Make sure the backend is running on port 5295" -ForegroundColor Yellow
    exit
}

# Test 2: Try different password formats
Write-Host "`n2. Testing different password formats..." -ForegroundColor Cyan

$passwords = @("Admin123", "admin123", "Admin@123", "admin@123")
$foundWorking = $false

foreach ($password in $passwords) {
    $loginBody = @{
        email = "admin@example.com"
        password = $password
    } | ConvertTo-Json
    
    Write-Host "  Trying password: $password" -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        if ($response.token) {
            Write-Host " ✅ SUCCESS!" -ForegroundColor Green
            Write-Host "  Token received: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
            $foundWorking = $true
            break
        }
    } catch {
        Write-Host " ❌ Failed" -ForegroundColor Red
    }
}

if (-not $foundWorking) {
    Write-Host "`n3. Checking raw response..." -ForegroundColor Cyan
    
    # Try with verbose error handling
    $loginBody = @{
        email = "admin@example.com"
        password = "Admin123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -UseBasicParsing
        Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host "Response Content: $($response.Content)" -ForegroundColor Yellow
    } catch {
        Write-Host "Error Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get response body
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error Response: $responseBody" -ForegroundColor Red
        }
    }
    
    Write-Host "`n4. Possible solutions:" -ForegroundColor Yellow
    Write-Host "   - Check if user 'admin@example.com' exists in the database" -ForegroundColor White
    Write-Host "   - Verify the password is 'Admin123' (capital A)" -ForegroundColor White
    Write-Host "   - Run the data seeder first to create demo users" -ForegroundColor White
    Write-Host "   - Check the backend logs for authentication errors" -ForegroundColor White
}