# PowerShell script to diagnose and fix backend startup issues

Write-Host "🔧 Backend Startup Diagnostic Tool" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if PostgreSQL is running
Write-Host "`n1. Checking PostgreSQL status..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL is not running" -ForegroundColor Red
        Write-Host "   Starting PostgreSQL..." -ForegroundColor Yellow
        Start-Service $pgService.Name
    }
} else {
    Write-Host "⚠️  PostgreSQL service not found. Make sure it's installed." -ForegroundColor Red
}

# Test database connection
Write-Host "`n2. Testing database connection..." -ForegroundColor Yellow
$connectionString = "Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=P@ssword!@"

# Check if .NET 8 SDK is installed
Write-Host "`n3. Checking .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET SDK version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ .NET SDK not found. Please install .NET 8 SDK" -ForegroundColor Red
    Write-Host "   Download from: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
$backendPath = "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "`n4. Found backend directory: $backendPath" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

# Restore packages
Write-Host "`n5. Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore

# Build the project
Write-Host "`n6. Building the project..." -ForegroundColor Yellow
$buildResult = dotnet build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Check the errors above." -ForegroundColor Red
    exit 1
}

# Check for common issues
Write-Host "`n7. Checking for common issues..." -ForegroundColor Yellow

# Check if port 5295 is in use
$portInUse = Get-NetTCPConnection -LocalPort 5295 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 5295 is already in use by process ID: $($portInUse.OwningProcess)" -ForegroundColor Red
    $process = Get-Process -Id $portInUse.OwningProcess
    Write-Host "   Process: $($process.ProcessName)" -ForegroundColor Yellow
    
    $response = Read-Host "   Kill this process? (y/n)"
    if ($response -eq 'y') {
        Stop-Process -Id $portInUse.OwningProcess -Force
        Write-Host "   Process killed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Port 5295 is available" -ForegroundColor Green
}

# Try to run the backend
Write-Host "`n8. Starting the backend..." -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray

# Run with detailed logging
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:Logging__LogLevel__Default = "Debug"
$env:Logging__LogLevel__Microsoft = "Information"
$env:Logging__LogLevel__Microsoft.Hosting.Lifetime = "Information"

dotnet run --no-build