# PowerShell script to trigger data seeding
$baseUrl = "http://localhost:5227/api"
$adminEmail = "admin@example.com"
$adminPassword = "Admin123"

Write-Host "Triggering Data Seed..." -ForegroundColor Green

# Login as admin
Write-Host "Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful!" -ForegroundColor Green
    
    # Create headers with token
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Trigger seed
    Write-Host "Triggering data seed..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/admin/seed" -Method Post -Headers $headers
        Write-Host "Seed response: $($response.message)" -ForegroundColor Green
    } catch {
        Write-Host "Error triggering seed: $_" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
}

Write-Host "`nCompleted!" -ForegroundColor Green