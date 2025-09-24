# Clear users for reseeding
Write-Host "Clearing users for reseeding..." -ForegroundColor Yellow

$env:PGPASSWORD = "P@ssword!@"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

& $psqlPath -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\clear-users-for-reseed.sql"

Write-Host "Users cleared! The application will reseed on next startup." -ForegroundColor Green