# Deploy .NET API to IIS with automatic IIS stop/start
# Run this script as Administrator

Write-Host "=== CeceLearningPortal API Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "This script must be run as Administrator. Exiting..." -ForegroundColor Red
    exit 1
}

# Stop IIS to release file locks
Write-Host "Stopping IIS to release file locks..." -ForegroundColor Yellow
try {
    iisreset /stop
    Write-Host "IIS stopped successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to stop IIS: $_" -ForegroundColor Red
    exit 1
}

# Wait a moment to ensure files are released
Start-Sleep -Seconds 3

# Navigate to API project directory
Write-Host ""
Write-Host "Navigating to API project directory..." -ForegroundColor Yellow
cd "C:\Users\Win11\Downloads\Cece-20250805T084305Z-1-001\Cece\Cece-master\Cece-master\CeceLearningPortal.Backend\CeceLearningPortal.Api"

# Clean previous build artifacts
Write-Host "Cleaning previous build artifacts..." -ForegroundColor Yellow
dotnet clean -c Release

# Publish the application
Write-Host ""
Write-Host "Publishing application to IIS directory..." -ForegroundColor Yellow
try {
    dotnet publish -c Release -o C:\inetpub\wwwroot\CeceLearningApi
    Write-Host "Application published successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to publish application: $_" -ForegroundColor Red
    # Try to start IIS even if publish failed
    iisreset /start
    exit 1
}

# Create logs directory if it doesn't exist
$logsPath = "C:\inetpub\wwwroot\CeceLearningApi\logs"
if (!(Test-Path $logsPath)) {
    Write-Host ""
    Write-Host "Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logsPath -Force
    
    # Grant permissions to IIS_IUSRS
    icacls $logsPath /grant "IIS_IUSRS:(OI)(CI)F" /T
    Write-Host "Logs directory created and permissions set." -ForegroundColor Green
}

# Start IIS
Write-Host ""
Write-Host "Starting IIS..." -ForegroundColor Yellow
try {
    iisreset /start
    Write-Host "IIS started successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to start IIS: $_" -ForegroundColor Red
    exit 1
}

# Test the deployment
Write-Host ""
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5  # Give IIS time to fully start

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5295/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Health check passed! API is running." -ForegroundColor Green
    } else {
        Write-Host "Health check returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Health check failed. This might be normal if the health endpoint doesn't exist." -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Cyan
Write-Host "API URL: http://localhost:5295" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update appsettings.Production.json with production database connection string" -ForegroundColor White
Write-Host "2. Configure HTTPS binding in IIS if needed" -ForegroundColor White
Write-Host "3. Update frontend API URL to point to this deployment" -ForegroundColor White