# Create admin user
Write-Host "Creating admin user..." -ForegroundColor Green

$env:PGPASSWORD = "P@ssword!@"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

& $psqlPath -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\create-admin-user.sql"

Write-Host "Admin user created!" -ForegroundColor Green