-- Check all column names in courses table
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;