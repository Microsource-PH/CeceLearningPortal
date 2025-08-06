# PowerShell script to clear database and re-seed with consistent data

Write-Host "🔄 Database Reset and Re-seed Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Configuration
$connectionString = "Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=P@ssword!@"

# Step 1: Backup current data (optional)
Write-Host "`n1. Creating backup of current data..." -ForegroundColor Yellow
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$backupDate.sql"

# You can uncomment this to create a backup
# pg_dump -h localhost -U postgres -d CeceLearningPortal > $backupFile

# Step 2: Clear existing data
Write-Host "`n2. Clearing existing data..." -ForegroundColor Yellow

$clearScript = @"
-- Clear data in correct order to avoid foreign key violations
TRUNCATE TABLE "Payments" CASCADE;
TRUNCATE TABLE "Reviews" CASCADE;
TRUNCATE TABLE "Enrollments" CASCADE;
TRUNCATE TABLE "Lessons" CASCADE;
TRUNCATE TABLE "CourseModules" CASCADE;
TRUNCATE TABLE "Courses" CASCADE;
TRUNCATE TABLE "Subscriptions" CASCADE;
TRUNCATE TABLE "SubscriptionPlans" CASCADE;

-- Clear user data except the initial seeded users
DELETE FROM "AspNetUserRoles" WHERE "UserId" NOT IN (
    SELECT "Id" FROM "AspNetUsers" 
    WHERE "Email" IN ('admin@example.com', 'instructor@example.com', 'michael.chen@example.com', 'emily.davis@example.com')
);

DELETE FROM "AspNetUsers" WHERE "Email" NOT IN (
    'admin@example.com', 
    'instructor@example.com', 
    'michael.chen@example.com', 
    'emily.davis@example.com'
);
"@

# Create a temporary SQL file
$clearScript | Out-File -FilePath "clear_data.sql" -Encoding UTF8

# Execute the clear script
Write-Host "   Executing clear script..." -ForegroundColor Gray
$env:PGPASSWORD = "P@ssword!@"
psql -h localhost -U postgres -d CeceLearningPortal -f clear_data.sql

# Clean up
Remove-Item "clear_data.sql"

Write-Host "   ✅ Data cleared successfully" -ForegroundColor Green

# Step 3: Restart the backend to trigger re-seeding
Write-Host "`n3. Starting backend to trigger data seeding..." -ForegroundColor Yellow

# Navigate to backend directory
$backendPath = "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"
Set-Location $backendPath

# Build the project
Write-Host "   Building backend..." -ForegroundColor Gray
dotnet build

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build successful" -ForegroundColor Green
    
    # Run the backend
    Write-Host "`n4. Running backend (this will trigger automatic seeding)..." -ForegroundColor Yellow
    Write-Host "   Watch for 'Database seeding completed successfully!' message" -ForegroundColor Gray
    Write-Host "   Press Ctrl+C to stop after seeding is complete" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    
    # Set environment for detailed logging
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:Logging__LogLevel__Default = "Information"
    
    dotnet run
} else {
    Write-Host "   ❌ Build failed. Please fix build errors and try again." -ForegroundColor Red
}