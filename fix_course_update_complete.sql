-- Complete fix for course update issues
-- This script addresses both the trigger and missing column issues

-- Option 1: Drop the problematic trigger completely
DROP TRIGGER IF EXISTS update_instructor_stats_on_course_change ON courses;
DROP FUNCTION IF EXISTS update_instructor_stats();

-- Option 2: If you want to keep instructor stats functionality, create a simpler version
-- that doesn't rely on non-existent columns

-- First, check if instructor_stats table exists and what columns it has
-- You can run this query to see the table structure:
-- \d instructor_stats

-- Create a simple function that just updates the timestamp
CREATE OR REPLACE FUNCTION update_instructor_stats_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Just update the updated_at timestamp for the instructor
    UPDATE instructor_stats 
    SET updated_at = NOW()
    WHERE user_id = COALESCE(NEW.instructor_id, OLD.instructor_id);
    
    -- If no row exists, create one with basic info
    IF NOT FOUND THEN
        INSERT INTO instructor_stats (user_id, total_students, active_courses, total_revenue, updated_at)
        VALUES (
            COALESCE(NEW.instructor_id, OLD.instructor_id),
            0,  -- Will be calculated separately
            0,  -- Will be calculated separately  
            0,  -- Will be calculated separately
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a simple trigger that just tracks updates
CREATE TRIGGER update_instructor_stats_timestamp
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_instructor_stats_simple();

-- Alternative: If you want to completely disable all triggers on courses table
-- ALTER TABLE courses DISABLE TRIGGER ALL;

-- To re-enable triggers later:
-- ALTER TABLE courses ENABLE TRIGGER ALL;