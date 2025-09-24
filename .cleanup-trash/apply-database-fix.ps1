$env:PGPASSWORD = "P@ssword!@"
Write-Host "Applying comprehensive database mappings..."
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\fix-all-database-mappings.sql" 2>&1
Write-Host "Database mappings applied!"