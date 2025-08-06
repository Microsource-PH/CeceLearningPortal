@echo off
echo Killing all CeceLearningPortal processes...
taskkill /F /IM CeceLearningPortal.Api.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul
taskkill /F /PID 34804 2>nul
timeout /t 2 >nul
echo Done.