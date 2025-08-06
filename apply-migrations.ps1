# PowerShell script to apply migrations using EF Core
Write-Host "Applying EF Core Migrations..." -ForegroundColor Green

# Navigate to API directory
Set-Location "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

# Apply migrations
Write-Host "`nApplying database migrations..." -ForegroundColor Yellow
dotnet ef database update --project CeceLearningPortal.Api.csproj --context ApplicationDbContext

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nMigrations applied successfully!" -ForegroundColor Green
} else {
    Write-Host "`nError applying migrations!" -ForegroundColor Red
}