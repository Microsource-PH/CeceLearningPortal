-- Check for course module related tables
SELECT tablename 
FROM pg_tables 
WHERE tablename ILIKE '%module%' 
   OR tablename ILIKE '%lesson%'
   OR tablename ILIKE '%review%'
   OR tablename ILIKE '%enrollment%'
ORDER BY tablename;