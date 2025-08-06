-- Check columns in course_lessons
SELECT 'course_lessons' as table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'course_lessons'
UNION ALL
-- Check columns in course_reviews  
SELECT 'course_reviews' as table_name, column_name
FROM information_schema.columns
WHERE table_name = 'course_reviews'
UNION ALL
-- Check columns in enrollments
SELECT 'enrollments' as table_name, column_name
FROM information_schema.columns
WHERE table_name = 'enrollments'
ORDER BY table_name, column_name;