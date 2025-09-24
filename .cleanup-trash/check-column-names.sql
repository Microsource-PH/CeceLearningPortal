-- Check actual column names in courses table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position
LIMIT 10;