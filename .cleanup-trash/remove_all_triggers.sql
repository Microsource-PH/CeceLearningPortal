-- First, list all triggers on the courses table to see what's there
SELECT tgname FROM pg_trigger WHERE tgrelid = 'courses'::regclass AND tgisinternal = false;

-- Drop ALL triggers on the courses table
DO $$
DECLARE
    trigger_name text;
BEGIN
    FOR trigger_name IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'courses'::regclass 
        AND tgisinternal = false
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON courses', trigger_name);
        RAISE NOTICE 'Dropped trigger: %', trigger_name;
    END LOOP;
END $$;

-- Also drop any functions that might be related
DROP FUNCTION IF EXISTS update_instructor_stats() CASCADE;
DROP FUNCTION IF EXISTS update_instructor_stats_simple() CASCADE;
DROP FUNCTION IF EXISTS update_instructor_stats_minimal() CASCADE;

-- Verify no triggers remain
SELECT 'Remaining triggers:' as info;
SELECT tgname FROM pg_trigger WHERE tgrelid = 'courses'::regclass AND tgisinternal = false;