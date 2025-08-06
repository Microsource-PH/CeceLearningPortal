@echo off
echo ======================================
echo Checking .NET SDK versions
echo ======================================
echo.

echo Installed .NET SDKs:
dotnet --list-sdks
echo.

echo Current .NET version:
dotnet --version
echo.

echo ======================================
echo The project requires .NET 9.0
echo ======================================
echo.

echo To install .NET 9.0 SDK:
echo 1. Visit: https://dotnet.microsoft.com/download/dotnet/9.0
echo 2. Download the .NET 9.0 SDK installer for Windows
echo 3. Run the installer
echo 4. Restart your terminal/command prompt
echo.

echo Alternatively, you can use winget:
echo   winget install Microsoft.DotNet.SDK.9
echo.

pause