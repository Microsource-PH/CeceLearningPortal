@echo off
echo ========================================
echo Quick Backend Start
echo ========================================

cd /d "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

echo.
echo Restoring packages...
dotnet restore

echo.
echo Building project...
dotnet build

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Build failed! See errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Starting backend on http://localhost:5295
echo Press Ctrl+C to stop
echo.

dotnet run

pause