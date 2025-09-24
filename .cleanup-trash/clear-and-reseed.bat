@echo off
echo ========================================
echo Database Clear and Re-seed Script
echo ========================================

echo.
echo WARNING: This will clear all existing data!
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

:: Navigate to backend directory
cd /d "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

:: Set environment for development
set ASPNETCORE_ENVIRONMENT=Development

:: Build the project
echo.
echo Building backend...
dotnet build

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful!
echo.
echo Starting backend to trigger data seeding...
echo Watch for "Database seeding completed successfully!" message
echo.
echo After seeding completes, press Ctrl+C to stop
echo.

:: Run the backend which will trigger seeding
dotnet run

pause