-- Check for AspNet Identity tables
SELECT tablename 
FROM pg_tables 
WHERE tablename ILIKE 'aspnet%'
ORDER BY tablename;