# PowerShell script to apply SQL migration
Write-Host "Applying SQL Migration to PostgreSQL..." -ForegroundColor Green

# Database connection details
$server = "localhost"
$port = "5432"
$database = "CeceLearningPortal"
$username = "postgres"
$password = "P@ssword!@"

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $password

Write-Host "`nApplying migration SQL..." -ForegroundColor Yellow

# Apply the SQL file
psql -h $server -p $port -d $database -U $username -f "D:\ProductDevelopment\Cece\apply-migration-sql.sql"

# Clear password
$env:PGPASSWORD = ""

Write-Host "`nMigration SQL applied!" -ForegroundColor Green