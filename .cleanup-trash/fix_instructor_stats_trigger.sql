-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_instructor_stats_on_course_change ON courses;

-- Create or replace the function that updates instructor stats
CREATE OR REPLACE FUNCTION update_instructor_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update instructor stats when a course is created or updated
    INSERT INTO instructor_stats (
        user_id, 
        total_students, 
        active_courses, 
        total_revenue, 
        updated_at
    )
    SELECT 
        COALESCE(NEW.instructor_id, OLD.instructor_id),
        COALESCE((
            SELECT COUNT(DISTINCT e.student_id)
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = COALESCE(NEW.instructor_id, OLD.instructor_id)
        ), 0),
        COUNT(CASE WHEN c.status = 1 THEN 1 END), -- Active status = 1
        COALESCE(SUM(
            CASE 
                WHEN c.pricing_model = 0 THEN 0 -- Free = 0
                ELSE c.price * (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)
            END
        ), 0),
        NOW()
    FROM courses c
    WHERE c.instructor_id = COALESCE(NEW.instructor_id, OLD.instructor_id)
    GROUP BY c.instructor_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_students = EXCLUDED.total_students,
        active_courses = EXCLUDED.active_courses,
        total_revenue = EXCLUDED.total_revenue,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_instructor_stats_on_course_change
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_instructor_stats();