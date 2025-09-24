-- Check ALL triggers in the entire database that might reference courses table
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_functiondef(t.tgfoid) as trigger_function
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
AND (
    c.relname = 'courses' 
    OR pg_get_functiondef(t.tgfoid) LIKE '%courses%'
    OR pg_get_functiondef(t.tgfoid) LIKE '%instructor_id%'
)
ORDER BY n.nspname, c.relname, t.tgname;

-- Also check if there are any views that might be causing issues
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE definition LIKE '%courses%'
AND schemaname NOT IN ('pg_catalog', 'information_schema');

-- Check for any stored procedures that might be triggered
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
AND (
    pg_get_functiondef(p.oid) LIKE '%courses%'
    OR pg_get_functiondef(p.oid) LIKE '%instructor_stats%'
);