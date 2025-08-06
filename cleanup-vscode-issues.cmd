@echo off
echo Cleaning up VSCode file issues...

REM Remove all macOS resource fork files (already done but checking again)
echo Removing macOS resource fork files...
for /r %%i in (._*) do del "%%i" 2>nul

REM Remove .DS_Store files
echo Removing .DS_Store files...
for /r %%i in (.DS_Store) do del "%%i" 2>nul

REM Clear VSCode workspace storage that might be corrupted
echo Clearing VSCode workspace cache...
rmdir /s /q ".vscode" 2>nul
mkdir .vscode

REM Create fresh VSCode settings
echo Creating fresh VSCode settings...
echo { > .vscode\settings.json
echo   "files.encoding": "utf8", >> .vscode\settings.json
echo   "files.eol": "\n", >> .vscode\settings.json
echo   "files.autoGuessEncoding": false, >> .vscode\settings.json
echo   "files.trimTrailingWhitespace": true, >> .vscode\settings.json
echo   "files.trimFinalNewlines": true, >> .vscode\settings.json
echo   "files.insertFinalNewline": true >> .vscode\settings.json
echo } >> .vscode\settings.json

echo.
echo Cleanup completed!
echo.
echo Please do the following:
echo 1. Close VSCode completely
echo 2. Run: powershell -ExecutionPolicy Bypass -File fix-encoding.ps1
echo 3. Restart VSCode
echo 4. If issues persist, try: File ^> Preferences ^> Settings ^> Text Editor ^> Files ^> Encoding ^> UTF-8
echo.
pause