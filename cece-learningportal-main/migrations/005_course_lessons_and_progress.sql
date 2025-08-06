-- Create course sections table
CREATE TABLE IF NOT EXISTS course_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'text', 'quiz', 'assignment')),
    content_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Create indexes for better performance
CREATE INDEX idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX idx_course_lessons_section_id ON course_lessons(section_id);
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(p_enrollment_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress DECIMAL;
BEGIN
    -- Get total lessons for the course
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons cl
    JOIN enrollments e ON cl.course_id = e.course_id
    WHERE e.id = p_enrollment_id;
    
    -- Get completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress lp
    WHERE lp.enrollment_id = p_enrollment_id
    AND lp.status = 'completed';
    
    -- Calculate progress
    IF total_lessons > 0 THEN
        progress := (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100;
    ELSE
        progress := 0;
    END IF;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update enrollment progress when lesson progress changes
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    new_progress DECIMAL;
BEGIN
    -- Calculate new progress
    new_progress := calculate_course_progress(NEW.enrollment_id);
    
    -- Update enrollment progress
    UPDATE enrollments
    SET progress = new_progress,
        updated_at = CURRENT_TIMESTAMP,
        status = CASE 
            WHEN new_progress = 100 THEN 'completed'
            WHEN new_progress > 0 THEN 'active'
            ELSE 'active'
        END,
        completed_at = CASE 
            WHEN new_progress = 100 THEN CURRENT_TIMESTAMP
            ELSE NULL
        END
    WHERE id = NEW.enrollment_id;
    
    -- Update user stats
    IF new_progress = 100 THEN
        UPDATE user_stats
        SET completed_courses = completed_courses + 1,
            in_progress_courses = GREATEST(in_progress_courses - 1, 0)
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_progress
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- Add sample course content for existing courses
INSERT INTO course_sections (course_id, title, description, order_index)
SELECT 
    c.id,
    'Introduction',
    'Getting started with ' || c.title,
    1
FROM courses c
WHERE NOT EXISTS (
    SELECT 1 FROM course_sections cs WHERE cs.course_id = c.id
);

-- Add sample lessons
INSERT INTO course_lessons (section_id, course_id, title, description, type, duration_minutes, order_index)
SELECT 
    cs.id,
    cs.course_id,
    'Welcome to the Course',
    'Introduction and course overview',
    'video',
    10,
    1
FROM course_sections cs
WHERE NOT EXISTS (
    SELECT 1 FROM course_lessons cl WHERE cl.section_id = cs.id
);

INSERT INTO course_lessons (section_id, course_id, title, description, type, duration_minutes, order_index)
SELECT 
    cs.id,
    cs.course_id,
    'Key Concepts',
    'Understanding the fundamentals',
    'video',
    30,
    2
FROM course_sections cs
WHERE NOT EXISTS (
    SELECT 1 FROM course_lessons cl WHERE cl.section_id = cs.id AND cl.order_index = 2
);

INSERT INTO course_lessons (section_id, course_id, title, description, type, duration_minutes, order_index)
SELECT 
    cs.id,
    cs.course_id,
    'Practice Exercise',
    'Apply what you learned',
    'assignment',
    45,
    3
FROM course_sections cs
WHERE NOT EXISTS (
    SELECT 1 FROM course_lessons cl WHERE cl.section_id = cs.id AND cl.order_index = 3
);