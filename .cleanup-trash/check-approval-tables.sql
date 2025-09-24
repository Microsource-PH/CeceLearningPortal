-- Check for approval related tables
SELECT tablename 
FROM pg_tables 
WHERE tablename LIKE '%approval%' OR tablename LIKE '%instructor%'
ORDER BY tablename;