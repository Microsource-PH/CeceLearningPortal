$env:PGPASSWORD = "P@ssword!@"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\create-views-with-mappings.sql" 2>&1
Write-Host "All views created with mappings"