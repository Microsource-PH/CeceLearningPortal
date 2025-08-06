# Apply ASP.NET Identity views for snake_case mapping
Write-Host "Creating ASP.NET Identity views for snake_case mapping..." -ForegroundColor Green

$env:PGPASSWORD = "P@ssword!@"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

& $psqlPath -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\fix-aspnet-identity-views.sql"

Write-Host "ASP.NET Identity views created!" -ForegroundColor Green