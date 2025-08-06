-- Check columns in course_modules table
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'course_modules'
ORDER BY ordinal_position;