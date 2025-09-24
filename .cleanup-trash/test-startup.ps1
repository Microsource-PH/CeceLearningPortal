# PowerShell script to test application startup
Write-Host "Testing API Startup..." -ForegroundColor Green

# Navigate to API directory
Set-Location "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

# Clean and rebuild
Write-Host "`nCleaning project..." -ForegroundColor Yellow
dotnet clean

Write-Host "`nRestoring packages..." -ForegroundColor Yellow
dotnet restore

Write-Host "`nBuilding project..." -ForegroundColor Yellow
$buildResult = dotnet build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host $buildResult
    exit 1
}

Write-Host "`nBuild successful!" -ForegroundColor Green

# Try to run with detailed logging
Write-Host "`nStarting API with detailed logging..." -ForegroundColor Yellow
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:Logging__LogLevel__Default = "Debug"
$env:Logging__LogLevel__Microsoft = "Information"
$env:Logging__LogLevel__Microsoft.Hosting.Lifetime = "Information"

dotnet run --no-build