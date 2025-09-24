-- Check columns in key tables
SELECT 'courses' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name IN ('id', 'instructor_id', 'created_at', 'updated_at')
UNION ALL
SELECT 'course_modules' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'course_modules' AND column_name IN ('id', 'course_id', 'created_at', 'updated_at')
UNION ALL
SELECT 'users' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('id', 'email', 'created_at')
ORDER BY table_name, column_name;