-- Temporarily disable the trigger that's causing issues
DROP TRIGGER IF EXISTS update_instructor_stats_on_course_change ON courses;

-- You can re-enable it later once the instructor_stats table is properly set up