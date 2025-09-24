# PowerShell script to fix Dr. Sarah Johnson's data
# This will re-run the data seeder and fix payment records

$baseUrl = "http://localhost:5295"

# First, login as admin
$loginBody = @{
    email = "admin@example.com"
    password = "Admin123"
} | ConvertTo-Json

Write-Host "Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

if ($loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "Login successful!" -ForegroundColor Green
    
    # Setup headers with auth token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Step 1: Verify current instructor data
    Write-Host "`n1. Verifying current instructor data..." -ForegroundColor Yellow
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/verify-instructor-data" -Method Get -Headers $headers
        Write-Host "Current instructor data:" -ForegroundColor Cyan
        $verifyResponse | ForEach-Object {
            Write-Host "  - $($_.name) ($($_.email))"
            Write-Host "    Courses: $($_.totalCourses), Enrollments: $($_.totalEnrollments), Payments: $($_.totalPayments)"
            Write-Host "    Revenue: `$$($_.totalRevenue), Rating: $([math]::Round($_.averageRating, 2))"
        }
    } catch {
        Write-Host "Error verifying data: $_" -ForegroundColor Red
    }
    
    # Step 2: Trigger data seeding
    Write-Host "`n2. Re-running data seeder..." -ForegroundColor Yellow
    try {
        $seedResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/seed" -Method Post -Headers $headers
        Write-Host "Data seeding completed!" -ForegroundColor Green
        Write-Host $seedResponse.message
    } catch {
        Write-Host "Error seeding data: $_" -ForegroundColor Red
    }
    
    # Step 3: Fix instructor payments
    Write-Host "`n3. Fixing instructor payment records..." -ForegroundColor Yellow
    try {
        $fixResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/fix-instructor-payments" -Method Post -Headers $headers
        Write-Host "Payment fix completed!" -ForegroundColor Green
        Write-Host $fixResponse.message
        
        # Show updated summary
        Write-Host "`nUpdated instructor data:" -ForegroundColor Cyan
        $fixResponse.summary | ForEach-Object {
            Write-Host "  - $($_.name) ($($_.email))"
            Write-Host "    Courses: $($_.totalCourses), Enrollments: $($_.totalEnrollments), Payments: $($_.totalPayments)"
            Write-Host "    Revenue: `$$($_.totalRevenue), Rating: $([math]::Round($_.averageRating, 2))"
            Write-Host "    Creator Earnings (80%): `$$([math]::Round($_.totalRevenue * 0.8, 2))"
            Write-Host "    Platform Share (20%): `$$([math]::Round($_.totalRevenue * 0.2, 2))"
        }
    } catch {
        Write-Host "Error fixing payments: $_" -ForegroundColor Red
    }
    
    Write-Host "`nAll fixes completed! Please refresh the marketplace page to see updated data." -ForegroundColor Green
} else {
    Write-Host "Login failed!" -ForegroundColor Red
}