$env:PGPASSWORD = "P@ssword!@"
Write-Host "Creating ASP.NET Identity tables..."
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\create-aspnet-identity-tables.sql"
Write-Host "Identity tables created!"