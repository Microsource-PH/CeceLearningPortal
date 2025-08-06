# Fix notification preferences format
Write-Host "Fixing notification preferences format..." -ForegroundColor Green

$env:PGPASSWORD = "P@ssword!@"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

& $psqlPath -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\fix-notification-preferences.sql"

Write-Host "Notification preferences fixed!" -ForegroundColor Green