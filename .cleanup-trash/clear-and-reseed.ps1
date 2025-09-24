# PowerShell script to clear and reseed database
Write-Host "Clearing and Reseeding Database..." -ForegroundColor Green

# Database connection details
$server = "localhost"
$port = "5432"
$database = "CeceLearningPortal"
$username = "postgres"

Write-Host "Enter PostgreSQL password for user '$username':" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Create connection string
$env:PGPASSWORD = $passwordText

Write-Host "`nClearing existing data..." -ForegroundColor Yellow

# Clear data in correct order to avoid foreign key constraints
$clearScript = @"
-- Clear data in reverse dependency order
TRUNCATE TABLE "Reviews" CASCADE;
TRUNCATE TABLE "LessonProgress" CASCADE;
TRUNCATE TABLE "Lessons" CASCADE;
TRUNCATE TABLE "CourseModules" CASCADE;
TRUNCATE TABLE "Payments" CASCADE;
TRUNCATE TABLE "Enrollments" CASCADE;
TRUNCATE TABLE "Notifications" CASCADE;
TRUNCATE TABLE "RefreshTokens" CASCADE;
TRUNCATE TABLE "PasswordHistories" CASCADE;
TRUNCATE TABLE "InstructorApprovals" CASCADE;
TRUNCATE TABLE "Subscriptions" CASCADE;
TRUNCATE TABLE "SubscriptionPlans" CASCADE;
TRUNCATE TABLE "Courses" CASCADE;
-- Don't truncate AspNetUsers as it would delete our admin
-- TRUNCATE TABLE "AspNetUsers" CASCADE;
"@

# Save to temp file
$clearScript | Out-File -FilePath ".\temp_clear.sql" -Encoding UTF8

# Execute clear script
psql -h $server -p $port -d $database -U $username -f ".\temp_clear.sql"

Write-Host "`nApplying manual migration..." -ForegroundColor Yellow
psql -h $server -p $port -d $database -U $username -f ".\manual-migration.sql"

# Clean up temp file
Remove-Item ".\temp_clear.sql" -ErrorAction SilentlyContinue

Write-Host "`nDatabase cleared. Please restart the API to trigger reseeding." -ForegroundColor Green
Write-Host "Run: cd CeceLearningPortal.Backend\CeceLearningPortal.Api && dotnet run" -ForegroundColor Cyan

# Clear password from environment
$env:PGPASSWORD = ""