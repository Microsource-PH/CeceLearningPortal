# PowerShell script to fix file encoding issues in VSCode

Write-Host "Fixing file encoding issues..." -ForegroundColor Green

# Function to fix file encoding
function Fix-FileEncoding {
    param($Path)
    
    # Skip binary files and node_modules
    if ($Path -match "node_modules|\.git|\.png|\.jpg|\.jpeg|\.gif|\.ico|\.svg|\.woff|\.ttf|\.eot") {
        return
    }
    
    try {
        # Read file content
        $content = Get-Content $Path -Raw -ErrorAction Stop
        
        # Check if file has content
        if ($content) {
            # Remove BOM and save as UTF-8 without BOM
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($Path, $content, $utf8NoBom)
        }
    }
    catch {
        Write-Host "Skipping binary or inaccessible file: $Path" -ForegroundColor Yellow
    }
}

# Fix all text files in the project
$extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.css", "*.scss", "*.html", "*.md", "*.txt", "*.yml", "*.yaml", "*.xml", "*.cs", "*.csproj", "*.sln")

foreach ($ext in $extensions) {
    Write-Host "Processing $ext files..." -ForegroundColor Cyan
    Get-ChildItem -Path . -Filter $ext -Recurse -File | ForEach-Object {
        Fix-FileEncoding -Path $_.FullName
    }
}

Write-Host "Encoding fix completed!" -ForegroundColor Green
Write-Host "Please restart VSCode to see the changes." -ForegroundColor Yellow