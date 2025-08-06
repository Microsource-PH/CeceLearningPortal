# Fix Database Trigger Issue

The course update is failing because there's a database trigger that's causing issues. Follow these steps to fix it:

## Step 1: Check Current Database Status

First, check if you're getting any errors when updating courses:
- If you see "column c.total_students does not exist" - the trigger has the wrong column
- If you see "column last_activity does not exist" - the instructor_stats table is missing columns

## Step 2: Apply the Fix

Run ONE of these solutions:

### Option A: Complete Fix (Recommended)
```bash
psql -U your_username -d cece_learningportal -f fix_course_update_complete.sql
```

### Option B: Simple Disable (Quick Testing)
```bash
psql -U your_username -d cece_learningportal -f disable_trigger.sql
```

### Option C: Manual Fix in psql
```sql
-- Connect to your database
psql -U your_username -d cece_learningportal

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS update_instructor_stats_on_course_change ON courses;

-- Verify it's gone
\dt courses
```

## Step 3: Test Course Update

After applying the fix:
1. Try updating a course in the UI
2. Check if all fields are saved properly
3. Verify no 500 errors occur

## Step 4: Verify Changes

To confirm the course data is actually being saved:
```sql
-- Check a specific course
SELECT id, title, course_type, pricing_model, language, updated_at 
FROM courses 
WHERE id = YOUR_COURSE_ID;
```

Or manually run this SQL in your database:

```sql
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
        last_activity,
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
        NOW(),
        NOW()
    FROM courses c
    WHERE c.instructor_id = COALESCE(NEW.instructor_id, OLD.instructor_id)
    GROUP BY c.instructor_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_students = EXCLUDED.total_students,
        active_courses = EXCLUDED.active_courses,
        total_revenue = EXCLUDED.total_revenue,
        last_activity = EXCLUDED.last_activity,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_instructor_stats_on_course_change
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_instructor_stats();
```

## Alternative: Add the missing column

If you prefer, you can add the missing column to the courses table:

```sql
ALTER TABLE courses ADD COLUMN total_students INTEGER DEFAULT 0;
```

Then update it based on enrollments:

```sql
UPDATE courses c
SET total_students = (
    SELECT COUNT(*) 
    FROM enrollments e 
    WHERE e.course_id = c.id
);
```

After running one of these fixes, the course update should work properly.