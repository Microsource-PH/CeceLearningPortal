@echo off
set PGPASSWORD=P@ssword!@
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\rename-ghl-columns.sql"
echo Done!