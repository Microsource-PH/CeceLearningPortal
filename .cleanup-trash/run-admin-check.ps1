# Check admin user
Write-Host "Checking admin user..." -ForegroundColor Green

$env:PGPASSWORD = "P@ssword!@"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

& $psqlPath -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\check-admin-user.sql"

Write-Host "Done!" -ForegroundColor Green