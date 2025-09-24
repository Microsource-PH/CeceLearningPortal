-- Check if Courses is a table or view
SELECT 
    schemaname,
    tablename as name,
    'table' as type
FROM pg_tables
WHERE tablename = 'Courses'
UNION ALL
SELECT 
    schemaname,
    viewname as name,
    'view' as type
FROM pg_views
WHERE viewname = 'Courses';

-- List all tables with 'course' in the name
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE tablename ILIKE '%course%'
ORDER BY tablename;