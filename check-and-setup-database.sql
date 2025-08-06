-- Check and setup database for CeceLearningPortal
-- This script will check current state and apply necessary fixes

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check user count
SELECT COUNT(*) as user_count FROM users;

-- Check if we have any data in key tables
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM enrollments) as enrollments,
    (SELECT COUNT(*) FROM subscriptions) as subscriptions;

-- If no users exist, apply seed data
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM users) = 0 THEN
        RAISE NOTICE 'No users found. Please run the seed data script.';
    ELSE
        RAISE NOTICE 'Found % users in database', (SELECT COUNT(*) FROM users);
    END IF;
END $$;