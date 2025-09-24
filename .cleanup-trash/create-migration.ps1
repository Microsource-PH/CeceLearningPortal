# PowerShell script to create migration
Write-Host "Creating migration for SubscriptionPlan updates..." -ForegroundColor Green

# Navigate to API directory
Set-Location "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

# Stop the running API first
Write-Host "Please stop the running API (Ctrl+C in the API console) and press Enter to continue..."
Read-Host

# Create the migration
Write-Host "Creating migration..." -ForegroundColor Yellow
dotnet ef migrations add UpdateSubscriptionPlanAndReviewModels --context ApplicationDbContext

# Update the database
Write-Host "Updating database..." -ForegroundColor Yellow
dotnet ef database update --context ApplicationDbContext

Write-Host "Migration completed!" -ForegroundColor Green
Write-Host "You can now restart the API with 'dotnet run'" -ForegroundColor Cyan