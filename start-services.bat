@echo off
echo Starting CECE Services...

echo.
echo Starting Backend API on port 5295...
start "CECE Backend" cmd /k "cd /d D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api && dotnet run"

echo Waiting for backend to start...
timeout /t 5 >nul

echo.
echo Starting Frontend on port 8080...
start "CECE Frontend" cmd /k "cd /d D:\ProductDevelopment\Cece\cece-learningportal-main && npm run dev"

echo.
echo Services started!
echo Backend: http://localhost:5295
echo Frontend: http://localhost:8080
echo.
pause