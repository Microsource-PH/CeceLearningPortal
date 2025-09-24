# PowerShell script to apply GHL migration
$env:PGPASSWORD = "P@ssword!@"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\ghl-migration.sql"
Write-Host "Migration applied successfully"