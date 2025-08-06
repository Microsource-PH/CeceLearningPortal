@echo off
set PGPASSWORD=P@ssword!@
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\fix-all-column-names.sql"
echo Column fixes applied!