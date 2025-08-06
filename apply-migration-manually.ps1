# PowerShell script to manually apply migration
Write-Host "Applying Migration Manually to PostgreSQL..." -ForegroundColor Green

# Database connection details
$server = "localhost"
$port = "5432"
$database = "CeceLearningPortal"
$username = "postgres"

Write-Host "Enter PostgreSQL password for user '$username':" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $passwordText

Write-Host "`nApplying migration..." -ForegroundColor Yellow

# Create migration SQL with explicit schema
$migrationSql = @"
-- Add new columns to SubscriptionPlans table if they don't exist
DO `$`$
BEGIN
    -- Add PlanType column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'PlanType') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "PlanType" integer NOT NULL DEFAULT 0;
    END IF;
    
    -- Add MaxCoursesCanCreate column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'MaxCoursesCanCreate') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "MaxCoursesCanCreate" integer;
    END IF;
    
    -- Add MaxStudentsPerCourse column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'MaxStudentsPerCourse') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "MaxStudentsPerCourse" integer;
    END IF;
    
    -- Add TransactionFeePercentage column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'TransactionFeePercentage') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "TransactionFeePercentage" numeric;
    END IF;
    
    -- Add HasAnalytics column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'HasAnalytics') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "HasAnalytics" boolean NOT NULL DEFAULT false;
    END IF;
    
    -- Add HasPrioritySupport column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'HasPrioritySupport') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "HasPrioritySupport" boolean NOT NULL DEFAULT false;
    END IF;
    
    -- Add DisplayOrder column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'DisplayOrder') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "DisplayOrder" integer NOT NULL DEFAULT 0;
    END IF;
    
    -- Add IsRecommended column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SubscriptionPlans' AND column_name = 'IsRecommended') THEN
        ALTER TABLE "SubscriptionPlans" ADD COLUMN "IsRecommended" boolean NOT NULL DEFAULT false;
    END IF;
END;
`$`$;

-- Add IsFlagged column to Reviews table if it doesn't exist
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Reviews' AND column_name = 'IsFlagged') THEN
        ALTER TABLE "Reviews" ADD COLUMN "IsFlagged" boolean NOT NULL DEFAULT false;
    END IF;
END;
`$`$;

-- Clear existing subscription plans to allow reseeding
TRUNCATE TABLE "SubscriptionPlans" CASCADE;

SELECT 'Migration applied successfully!' as result;
"@

# Save to temp file
$migrationSql | Out-File -FilePath ".\temp_migration.sql" -Encoding UTF8

# Execute migration
psql -h $server -p $port -d $database -U $username -f ".\temp_migration.sql"

# Clean up
Remove-Item ".\temp_migration.sql" -ErrorAction SilentlyContinue

# Clear password
$env:PGPASSWORD = ""

Write-Host "`nMigration completed!" -ForegroundColor Green
Write-Host "You can now start the API with: dotnet run" -ForegroundColor Cyan