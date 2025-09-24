-- Create a student account for testing
INSERT INTO users (id, email, encrypted_password, created_at, updated_at)
VALUES 
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'student@example.com', '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gOMxldfaq', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, full_name, role, avatar_url, bio, location, created_at, updated_at)
VALUES 
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'John Student', 'Learner', 'https://ui-avatars.com/api/?name=John+Student&background=random', 'Passionate learner exploring new technologies', 'New York, NY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET role = 'Learner';

INSERT INTO user_stats (user_id, total_courses, completed_courses, in_progress_courses, total_hours, certificates, average_score, current_streak, longest_streak)
VALUES 
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 0, 0, 0, 0, 0, 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Create a subscription for the student
INSERT INTO subscriptions (user_id, plan_id, status, amount, start_date, expires_at, created_at, updated_at)
VALUES 
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'basic', 'active', 999.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, plan_id) DO UPDATE SET status = 'active', expires_at = CURRENT_TIMESTAMP + INTERVAL '30 days';

-- Enroll the student in Sarah Wilson's courses
INSERT INTO enrollments (user_id, course_id, progress, status)
SELECT 
  'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  c.id,
  CASE 
    WHEN c.title LIKE '%Fundamentals%' THEN 65
    ELSE 30
  END,
  CASE 
    WHEN c.title LIKE '%Fundamentals%' THEN 'active'
    ELSE 'active'
  END
FROM courses c
WHERE c.instructor_id = 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c'
AND NOT EXISTS (
  SELECT 1 FROM enrollments e 
  WHERE e.user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d' 
  AND e.course_id = c.id
);

-- Update user stats based on enrollments
UPDATE user_stats
SET 
  total_courses = (SELECT COUNT(*) FROM enrollments WHERE user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'),
  in_progress_courses = (SELECT COUNT(*) FROM enrollments WHERE user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d' AND status = 'active'),
  total_hours = 20
WHERE user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

-- Create some lesson progress for the student
INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id, status, progress_percentage, time_spent_minutes)
SELECT 
  'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  cl.id,
  e.id,
  CASE 
    WHEN cl.order_index = 1 THEN 'completed'
    WHEN cl.order_index = 2 AND e.course_id = (SELECT id FROM courses WHERE title LIKE '%Fundamentals%' LIMIT 1) THEN 'in_progress'
    ELSE 'not_started'
  END,
  CASE 
    WHEN cl.order_index = 1 THEN 100
    WHEN cl.order_index = 2 AND e.course_id = (SELECT id FROM courses WHERE title LIKE '%Fundamentals%' LIMIT 1) THEN 50
    ELSE 0
  END,
  CASE 
    WHEN cl.order_index = 1 THEN cl.duration_minutes
    WHEN cl.order_index = 2 AND e.course_id = (SELECT id FROM courses WHERE title LIKE '%Fundamentals%' LIMIT 1) THEN cl.duration_minutes / 2
    ELSE 0
  END
FROM course_lessons cl
JOIN enrollments e ON cl.course_id = e.course_id
WHERE e.user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
AND NOT EXISTS (
  SELECT 1 FROM lesson_progress lp 
  WHERE lp.user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d' 
  AND lp.lesson_id = cl.id
);

-- Add some learning activities
INSERT INTO activities (user_id, type, title, course_id, details)
SELECT 
  'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'course_enrolled',
  'Enrolled in ' || c.title,
  c.id,
  jsonb_build_object('course_title', c.title, 'instructor', 'Sarah Wilson')
FROM courses c
JOIN enrollments e ON c.id = e.course_id
WHERE e.user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
AND NOT EXISTS (
  SELECT 1 FROM activities a 
  WHERE a.user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d' 
  AND a.course_id = c.id
  AND a.type = 'course_enrolled'
);

-- Update enrollment progress based on lesson progress
UPDATE enrollments e
SET progress = (
  SELECT calculate_course_progress(e.id)
)
WHERE user_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d';