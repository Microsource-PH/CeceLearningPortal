-- Check for any remaining triggers on courses table
SELECT 'Triggers on courses table:' as info;
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'courses'::regclass;

-- Check for any foreign key constraints that might be causing issues
SELECT 'Foreign key constraints on courses table:' as info;
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='courses';

-- Check data types of key columns
SELECT 'Column data types in courses table:' as info;
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'courses'
AND column_name IN ('id', 'instructor_id', 'status', 'pricing_model', 'course_type');

-- Check if there are any check constraints
SELECT 'Check constraints on courses table:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'courses'::regclass 
AND contype = 'c';

-- Check for any rules on the table
SELECT 'Rules on courses table:' as info;
SELECT rulename 
FROM pg_rules 
WHERE tablename = 'courses';