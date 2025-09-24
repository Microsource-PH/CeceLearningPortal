@echo off
echo Stopping backend...
taskkill /F /IM dotnet.exe 2>nul
timeout /t 2 >nul
echo Starting backend...
cd /d "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"
start "Backend API" dotnet run
echo Backend restarted.