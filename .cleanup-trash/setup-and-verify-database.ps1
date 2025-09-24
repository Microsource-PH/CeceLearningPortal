# PowerShell script to setup and verify database
Write-Host "CeceLearningPortal Database Setup Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Set PostgreSQL password
$env:PGPASSWORD = "P@ssword!@"

# Find psql.exe
$psqlPath = $null
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files\PostgreSQL\12\bin\psql.exe"
)

foreach ($path in $pgPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "PostgreSQL not found! Please install PostgreSQL or use pgAdmin to run the SQL files manually." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin or DBeaver"
    Write-Host "2. Connect to your PostgreSQL server"
    Write-Host "3. Create database 'CeceLearningPortal' if it doesn't exist"
    Write-Host "4. Run the following SQL file:"
    Write-Host "   - seed-database-complete.sql"
    exit 1
}

Write-Host "Found PostgreSQL at: $psqlPath" -ForegroundColor Cyan
Write-Host ""

# Check if database exists
Write-Host "Checking if database exists..." -ForegroundColor Yellow
$dbExists = & $psqlPath -U postgres -t -c "SELECT 1 FROM pg_database WHERE datname='CeceLearningPortal'" 2>$null

if (-not $dbExists) {
    Write-Host "Creating database CeceLearningPortal..." -ForegroundColor Yellow
    & $psqlPath -U postgres -c "CREATE DATABASE ""CeceLearningPortal"";"
}

# Run the comprehensive seed script
Write-Host "Running seed data script..." -ForegroundColor Yellow
& $psqlPath -U postgres -d CeceLearningPortal -f "seed-database-complete.sql"

# Verify the data
Write-Host ""
Write-Host "Verifying data..." -ForegroundColor Yellow
$result = & $psqlPath -U postgres -d CeceLearningPortal -t -c @"
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM enrollments) as enrollments,
    (SELECT COUNT(*) FROM subscriptions) as subscriptions;
"@

Write-Host "Database contains:" -ForegroundColor Green
Write-Host $result

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Test users (password for all: 'password'):" -ForegroundColor Cyan
Write-Host "  - admin@example.com (Admin)"
Write-Host "  - instructor@example.com (Creator)"
Write-Host "  - student@example.com (Learner)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend API: cd CeceLearningPortal.Backend\CeceLearningPortal.Api && dotnet run"
Write-Host "2. Access the frontend at: http://localhost:8081/"