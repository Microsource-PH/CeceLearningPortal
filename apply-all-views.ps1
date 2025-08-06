$env:PGPASSWORD = "P@ssword!@"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\create-all-views.sql"
Write-Host "All views created successfully"