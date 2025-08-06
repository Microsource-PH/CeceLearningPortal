-- Seed data for Sarah Wilson
-- This script ensures Sarah Wilson has proper data in the PostgreSQL database

-- First, ensure Sarah Wilson exists as a user
INSERT INTO users (id, email, full_name, role, avatar_url, created_at, updated_at)
VALUES (
    'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
    'sarah.wilson@example.com',
    'Sarah Wilson',
    'Learner',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Create Dr. Sarah Johnson as instructor if not exists
INSERT INTO users (id, email, full_name, role, avatar_url, created_at, updated_at)
VALUES (
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'instructor@example.com',
    'Dr. Sarah Johnson',
    'Instructor',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Create Computer Vision Fundamentals course if not exists
INSERT INTO courses (id, title, description, price, original_price, instructor_id, category, duration, level, thumbnail, status, created_at, updated_at)
VALUES (
    2,
    'Computer Vision Fundamentals',
    'Learn the basics of computer vision and image processing',
    1999.00,
    2499.00,
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'Computer Vision',
    '32 hours',
    'Beginner',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Add Sarah Wilson's Premium subscription
INSERT INTO subscriptions (user_id, plan_id, status, started_at, expires_at, amount, created_at, updated_at)
VALUES (
    'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
    'premium',
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    49.99,
    NOW(),
    NOW()
) ON CONFLICT (user_id) WHERE status = 'active' DO UPDATE SET
    expires_at = NOW() + INTERVAL '30 days',
    updated_at = NOW();

-- Enroll Sarah Wilson in Computer Vision Fundamentals
INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
VALUES (
    'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
    2,
    NOW() - INTERVAL '7 days',
    45,
    'active'
) ON CONFLICT (user_id, course_id) DO UPDATE SET
    progress = 45,
    status = 'active';

-- Add a transaction record for the subscription
INSERT INTO transactions (user_id, course_id, subscription_plan_id, amount, type, status, created_at)
VALUES (
    'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
    NULL,
    'premium',
    49.99,
    'subscription',
    'completed',
    NOW()
);

-- Create course modules and lessons for progress tracking
DO $$
DECLARE
    module_id INTEGER;
    lesson_count INTEGER := 0;
BEGIN
    -- Create 10 modules for the course
    FOR i IN 1..10 LOOP
        INSERT INTO modules (course_id, title, description, "order", created_at, updated_at)
        VALUES (
            2,
            'Module ' || i || ': ' || 
            CASE i
                WHEN 1 THEN 'Introduction to Computer Vision'
                WHEN 2 THEN 'Image Processing Basics'
                WHEN 3 THEN 'Feature Detection'
                WHEN 4 THEN 'Image Segmentation'
                WHEN 5 THEN 'Object Detection'
                WHEN 6 THEN 'Face Recognition'
                WHEN 7 THEN 'Motion Analysis'
                WHEN 8 THEN 'Deep Learning for CV'
                WHEN 9 THEN 'Real-world Applications'
                WHEN 10 THEN 'Final Project'
            END,
            'Module ' || i || ' description',
            i,
            NOW(),
            NOW()
        ) RETURNING id INTO module_id;
        
        -- Create 10 lessons per module (total 100 lessons)
        FOR j IN 1..10 LOOP
            lesson_count := lesson_count + 1;
            INSERT INTO lessons (module_id, title, type, duration, video_url, content, "order", created_at, updated_at)
            VALUES (
                module_id,
                'Lesson ' || lesson_count || ': Topic ' || j,
                CASE WHEN j % 3 = 0 THEN 'quiz' ELSE 'video' END,
                CASE WHEN j % 3 = 0 THEN '15 minutes' ELSE '10 minutes' END,
                CASE WHEN j % 3 != 0 THEN 'https://example.com/video' || lesson_count ELSE NULL END,
                'Lesson content for lesson ' || lesson_count,
                j,
                NOW(),
                NOW()
            );
            
            -- Mark first 44 lessons as completed for Sarah Wilson
            IF lesson_count <= 44 THEN
                INSERT INTO lesson_progress (lesson_id, user_id, status, started_at, completed_at, time_spent_minutes, created_at, updated_at)
                VALUES (
                    lesson_count,
                    'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
                    'Completed',
                    NOW() - INTERVAL '7 days' + (lesson_count * INTERVAL '2 hours'),
                    NOW() - INTERVAL '7 days' + (lesson_count * INTERVAL '2 hours') + INTERVAL '30 minutes',
                    30,
                    NOW(),
                    NOW()
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Add some learning activity for Sarah Wilson
INSERT INTO activity_logs (user_id, activity_type, activity_data, created_at)
VALUES 
    ('b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c', 'course_enrolled', '{"course_id": 2, "course_name": "Computer Vision Fundamentals"}', NOW() - INTERVAL '7 days'),
    ('b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c', 'lesson_completed', '{"lesson_id": 1, "lesson_name": "Introduction to Computer Vision"}', NOW() - INTERVAL '6 days'),
    ('b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c', 'lesson_completed', '{"lesson_id": 44, "lesson_name": "Image Segmentation Basics"}', NOW() - INTERVAL '1 day');

-- Update enrollment statistics
UPDATE enrollments 
SET 
    last_accessed_at = NOW(),
    completed_lessons = 44,
    total_lessons = 100
WHERE user_id = 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c' AND course_id = 2;