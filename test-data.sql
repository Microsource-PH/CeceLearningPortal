-- Check if there's data in courses table
SELECT COUNT(*) as course_count FROM courses;

-- Check if there are users
SELECT COUNT(*) as user_count FROM "AspNetUsers";

-- Check columns in courses table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position 
LIMIT 10;