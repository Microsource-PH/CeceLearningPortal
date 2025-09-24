$env:PGPASSWORD = "P@ssword!@"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\create-simple-views.sql"
Write-Host "Simple views created!"