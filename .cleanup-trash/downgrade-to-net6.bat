@echo off
echo Downgrading CeceLearningPortal to .NET 6.0...
echo ==============================================

cd CeceLearningPortal.Backend\CeceLearningPortal.Api

echo Creating backup of original project file...
copy CeceLearningPortal.Api.csproj CeceLearningPortal.Api.csproj.bak

echo Updating project file to .NET 6.0...
powershell -Command "(Get-Content CeceLearningPortal.Api.csproj) -replace 'net9.0', 'net6.0' | Set-Content CeceLearningPortal.Api.csproj"

echo.
echo Project downgraded to .NET 6.0
echo.
echo Next steps:
echo 1. Run: dotnet restore
echo 2. Run: dotnet build
echo.

cd ..\..
pause