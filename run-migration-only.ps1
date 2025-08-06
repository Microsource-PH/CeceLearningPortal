# PowerShell script to run migration only
Write-Host "Running EF Core Migration..." -ForegroundColor Green

# Navigate to API directory
Set-Location "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

# List existing migrations
Write-Host "`nExisting migrations:" -ForegroundColor Yellow
dotnet ef migrations list --context ApplicationDbContext

# Create the migration if it doesn't exist
Write-Host "`nCreating new migration..." -ForegroundColor Yellow
dotnet ef migrations add UpdateSubscriptionPlanAndReviewModels --context ApplicationDbContext

# Update the database
Write-Host "`nUpdating database..." -ForegroundColor Yellow
dotnet ef database update --context ApplicationDbContext

Write-Host "`nMigration completed!" -ForegroundColor Green