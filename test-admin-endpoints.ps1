# PowerShell script to test admin endpoints
$baseUrl = "http://localhost:5227/api"
$adminEmail = "admin@example.com"
$adminPassword = "Admin123"

Write-Host "Testing Admin Endpoints..." -ForegroundColor Green

# Login as admin
Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful! Token received." -ForegroundColor Green
    
    # Create headers with token
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Test User Management
    Write-Host "`n2. Testing User Management - Getting users..." -ForegroundColor Yellow
    try {
        $users = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $headers
        Write-Host "Found $($users.Count) users" -ForegroundColor Green
    } catch {
        Write-Host "Error getting users: $_" -ForegroundColor Red
    }
    
    # Test User Stats
    Write-Host "`n3. Testing User Statistics..." -ForegroundColor Yellow
    try {
        $stats = Invoke-RestMethod -Uri "$baseUrl/admin/users/stats" -Method Get -Headers $headers
        Write-Host "User Stats:" -ForegroundColor Green
        Write-Host "  Total Users: $($stats.totalUsers)"
        Write-Host "  Active Users: $($stats.activeUsers)"
        Write-Host "  Pending Approvals: $($stats.pendingApprovals)"
    } catch {
        Write-Host "Error getting user stats: $_" -ForegroundColor Red
    }
    
    # Test Subscription Plans
    Write-Host "`n4. Testing Subscription Plans..." -ForegroundColor Yellow
    try {
        $plans = Invoke-RestMethod -Uri "$baseUrl/admin/subscription-plans" -Method Get -Headers $headers
        Write-Host "Found $($plans.Count) subscription plans" -ForegroundColor Green
        foreach ($plan in $plans) {
            Write-Host "  - $($plan.name) ($($plan.planType)): `$$($plan.monthlyPrice)/month"
        }
    } catch {
        Write-Host "Error getting subscription plans: $_" -ForegroundColor Red
    }
    
    # Test Subscribers
    Write-Host "`n5. Testing Subscribers..." -ForegroundColor Yellow
    try {
        $subscribers = Invoke-RestMethod -Uri "$baseUrl/admin/subscribers" -Method Get -Headers $headers
        Write-Host "Found $($subscribers.Count) subscribers" -ForegroundColor Green
    } catch {
        Write-Host "Error getting subscribers: $_" -ForegroundColor Red
    }
    
    # Test Course Management
    Write-Host "`n6. Testing Course Management..." -ForegroundColor Yellow
    try {
        $courses = Invoke-RestMethod -Uri "$baseUrl/admin/courses" -Method Get -Headers $headers
        Write-Host "Found $($courses.Count) courses" -ForegroundColor Green
    } catch {
        Write-Host "Error getting courses: $_" -ForegroundColor Red
    }
    
    # Test Course Statistics
    Write-Host "`n7. Testing Course Statistics..." -ForegroundColor Yellow
    try {
        $courseStats = Invoke-RestMethod -Uri "$baseUrl/admin/courses/statistics" -Method Get -Headers $headers
        Write-Host "Course Stats:" -ForegroundColor Green
        Write-Host "  Total Courses: $($courseStats.totalCourses)"
        Write-Host "  Active Courses: $($courseStats.activeCourses)"
        Write-Host "  Pending Review: $($courseStats.pendingReview)"
    } catch {
        Write-Host "Error getting course stats: $_" -ForegroundColor Red
    }
    
    # Test Subscription Statistics
    Write-Host "`n8. Testing Subscription Statistics..." -ForegroundColor Yellow
    try {
        $subStats = Invoke-RestMethod -Uri "$baseUrl/admin/subscriptions/statistics" -Method Get -Headers $headers
        Write-Host "Subscription Stats:" -ForegroundColor Green
        Write-Host "  Total Active Subscribers: $($subStats.totalActiveSubscribers)"
        Write-Host "  Monthly Recurring Revenue: `$$($subStats.monthlyRecurringRevenue)"
    } catch {
        Write-Host "Error getting subscription stats: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green