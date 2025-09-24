# Comprehensive PowerShell script to fix all VSCode file issues

Write-Host "`nFixing all VSCode file encoding and display issues..." -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

# 1. Remove all macOS metadata files
Write-Host "`n1. Removing macOS metadata files..." -ForegroundColor Yellow
$macFiles = Get-ChildItem -Path . -Filter "._*" -Recurse -Force -ErrorAction SilentlyContinue
$dsStoreFiles = Get-ChildItem -Path . -Filter ".DS_Store" -Recurse -Force -ErrorAction SilentlyContinue

$totalMacFiles = ($macFiles.Count + $dsStoreFiles.Count)
if ($totalMacFiles -gt 0) {
    Write-Host "   Found $totalMacFiles macOS files to remove" -ForegroundColor Cyan
    $macFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    $dsStoreFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Removed macOS metadata files" -ForegroundColor Green
} else {
    Write-Host "   ✓ No macOS metadata files found" -ForegroundColor Green
}

# 2. Fix file encodings
Write-Host "`n2. Converting files to UTF-8 without BOM..." -ForegroundColor Yellow

$extensions = @(
    "*.ts", "*.tsx", "*.js", "*.jsx", "*.json", 
    "*.css", "*.scss", "*.less", "*.html", "*.md", 
    "*.txt", "*.yml", "*.yaml", "*.xml", 
    "*.cs", "*.csproj", "*.sln", "*.config"
)

$totalFixed = 0
$problematicFiles = @()

foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path . -Filter $ext -Recurse -File -ErrorAction SilentlyContinue | 
             Where-Object { $_.FullName -notmatch "node_modules|\.git|dist|build|bin|obj" }
    
    foreach ($file in $files) {
        try {
            # Read the file
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            if ($null -ne $content) {
                # Check if file has BOM or wrong encoding
                $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
                $hasBOM = $false
                
                if ($bytes.Length -ge 3) {
                    $hasBOM = ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
                }
                
                # Always rewrite to ensure UTF-8 without BOM
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
                
                if ($hasBOM) {
                    Write-Host "   Fixed BOM in: $($file.Name)" -ForegroundColor Cyan
                }
                
                $totalFixed++
            }
        }
        catch {
            $problematicFiles += $file.FullName
        }
    }
}

Write-Host "   ✓ Processed $totalFixed files" -ForegroundColor Green
if ($problematicFiles.Count -gt 0) {
    Write-Host "   ! Skipped $($problematicFiles.Count) binary/inaccessible files" -ForegroundColor Yellow
}

# 3. Create/Update VSCode settings
Write-Host "`n3. Creating VSCode workspace settings..." -ForegroundColor Yellow

$vscodeDir = ".vscode"
if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
}

$settings = @{
    "files.encoding" = "utf8"
    "files.autoGuessEncoding" = $false
    "files.eol" = "`n"
    "files.trimTrailingWhitespace" = $true
    "files.trimFinalNewlines" = $true
    "files.insertFinalNewline" = $true
    "editor.renderWhitespace" = "none"
    "files.associations" = @{
        "*.ts" = "typescript"
        "*.tsx" = "typescriptreact"
        "*.js" = "javascript"
        "*.jsx" = "javascriptreact"
    }
    "files.exclude" = @{
        "**/.git" = $true
        "**/.DS_Store" = $true
        "**/._*" = $true
        "**/node_modules" = $true
    }
}

$settingsJson = $settings | ConvertTo-Json -Depth 10
Set-Content -Path "$vscodeDir\settings.json" -Value $settingsJson -Encoding UTF8

Write-Host "   ✓ Created .vscode/settings.json" -ForegroundColor Green

# 4. Clear VSCode cache (optional but recommended)
Write-Host "`n4. VSCode cache locations:" -ForegroundColor Yellow
Write-Host "   Windows: %APPDATA%\Code\Cache" -ForegroundColor Cyan
Write-Host "   Windows: %APPDATA%\Code\CachedData" -ForegroundColor Cyan

# Summary
Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "✓ File encoding fixes completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Close VSCode completely" -ForegroundColor White
Write-Host "2. (Optional) Clear VSCode cache:" -ForegroundColor White
Write-Host "   - Delete: %APPDATA%\Code\Cache" -ForegroundColor Gray
Write-Host "   - Delete: %APPDATA%\Code\CachedData" -ForegroundColor Gray
Write-Host "3. Restart VSCode" -ForegroundColor White
Write-Host "4. If any file still shows as binary:" -ForegroundColor White
Write-Host "   - Right-click the file in VSCode" -ForegroundColor Gray
Write-Host "   - Select 'Reopen with Encoding' > 'UTF-8'" -ForegroundColor Gray
Write-Host "`n"