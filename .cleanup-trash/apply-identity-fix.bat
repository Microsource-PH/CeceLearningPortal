@echo off
echo Applying ASP.NET Identity table views fix...
set PGPASSWORD=P@ssword!@
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d CeceLearningPortal -f "D:\ProductDevelopment\Cece\fix-aspnet-identity-views.sql"
echo Done.
pause