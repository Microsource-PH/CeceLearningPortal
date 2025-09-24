-- Drop the specific trigger that's causing issues
DROP TRIGGER IF EXISTS update_instructor_stats_minimal_trigger ON courses;

-- Drop the function
DROP FUNCTION IF EXISTS update_instructor_stats_minimal() CASCADE;

-- Drop ALL triggers on courses table by querying system tables
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT DISTINCT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table = 'courses'
        AND trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_rec.trigger_name, trigger_rec.event_object_table);
        RAISE NOTICE 'Dropped trigger: % on %', trigger_rec.trigger_name, trigger_rec.event_object_table;
    END LOOP;
END $$;

-- Also check and drop triggers that might be on instructor_stats table
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT DISTINCT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table = 'instructor_stats'
        AND trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_rec.trigger_name, trigger_rec.event_object_table);
        RAISE NOTICE 'Dropped trigger: % on %', trigger_rec.trigger_name, trigger_rec.event_object_table;
    END LOOP;
END $$;

-- Drop ALL functions that might reference instructor_stats
SELECT 'Dropping function: ' || proname 
FROM pg_proc 
WHERE prosrc LIKE '%instructor_stats%' 
AND pronamespace = 'public'::regnamespace;

DO $$
DECLARE
    func_rec RECORD;
BEGIN
    FOR func_rec IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE prosrc LIKE '%instructor_stats%' 
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', func_rec.proname, func_rec.args);
        RAISE NOTICE 'Dropped function: %', func_rec.proname;
    END LOOP;
END $$;

-- Final verification
\echo 'Remaining triggers on courses:'
SELECT * FROM information_schema.triggers WHERE event_object_table = 'courses';

\echo 'Remaining triggers on instructor_stats:'
SELECT * FROM information_schema.triggers WHERE event_object_table = 'instructor_stats';

\echo 'Remaining functions with instructor_stats:'
SELECT proname FROM pg_proc WHERE prosrc LIKE '%instructor_stats%' AND pronamespace = 'public'::regnamespace;