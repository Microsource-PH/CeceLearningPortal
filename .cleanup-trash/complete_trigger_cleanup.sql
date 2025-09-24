-- First, show all triggers on courses table
\echo 'Current triggers on courses table:'
SELECT tgname FROM pg_trigger WHERE tgrelid = 'courses'::regclass;

-- Drop ALL triggers on courses table (including any we might have missed)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'courses'::regclass AND NOT tgisinternal) 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON courses';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Drop all functions that might be related to courses or instructor_stats
DROP FUNCTION IF EXISTS update_instructor_stats() CASCADE;
DROP FUNCTION IF EXISTS update_instructor_stats_simple() CASCADE;
DROP FUNCTION IF EXISTS update_instructor_stats_minimal() CASCADE;
DROP FUNCTION IF EXISTS update_instructor_stats_on_course_change() CASCADE;

-- Check for any remaining functions that reference courses
\echo 'Functions that reference courses:'
SELECT proname FROM pg_proc WHERE prosrc LIKE '%courses%' AND pronamespace = 'public'::regnamespace;

-- Disable all rules on courses table
ALTER TABLE courses DISABLE RULE ALL;

-- Final check - no triggers should remain
\echo 'Final check - triggers on courses (should be empty):'
SELECT tgname FROM pg_trigger WHERE tgrelid = 'courses'::regclass AND NOT tgisinternal;

-- Show table structure to understand what we're working with
\echo 'Courses table structure:'
\d courses