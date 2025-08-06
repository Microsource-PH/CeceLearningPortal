@echo off
echo ========================================
echo Starting Cece Learning Portal Backend
echo ========================================

:: Navigate to backend directory
cd /d "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

:: Set environment to Development for better error messages
set ASPNETCORE_ENVIRONMENT=Development

:: Restore packages
echo.
echo Restoring packages...
dotnet restore

:: Build the project
echo.
echo Building project...
dotnet build

:: Check if build was successful
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

:: Run the application
echo.
echo Starting backend on http://localhost:5295
echo Press Ctrl+C to stop
echo.
dotnet run

pause