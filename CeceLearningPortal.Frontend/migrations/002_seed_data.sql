-- Seed data for CeceLearningPortal
-- Password for all users is 'password' (hashed with bcrypt)

-- Insert users
INSERT INTO users (id, email, encrypted_password) VALUES
    ('d7a3c5e4-5f2b-4a8c-9e1d-3b2a1c0d9e8f', 'admin@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'instructor@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'student@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'alex.chen@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'sophia.martinez@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    ('f1e2d3c4-5b6a-7089-9e8d-7c6b5a4e3d2c', 'prof.johnson@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    ('a9b8c7d6-5e4f-3210-9876-543210fedcba', 'emily.davis@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy')
ON CONFLICT (id) DO NOTHING;

-- Insert profiles
INSERT INTO profiles (id, full_name, avatar_url, bio, location, role, social_links) VALUES
    ('d7a3c5e4-5f2b-4a8c-9e1d-3b2a1c0d9e8f', 'Michael Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 'Platform administrator and technical lead. Ensuring smooth operations.', 'Seattle, WA', 'Admin', '{"linkedin": "https://linkedin.com/in/michaelchen", "twitter": "https://twitter.com/mchen_admin"}'),
    ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Dr. Sarah Johnson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', 'Senior Software Engineer with 10+ years of experience. Specializing in React, Node.js, and cloud architecture.', 'New York, NY', 'Creator', '{"linkedin": "https://linkedin.com/in/drsarahjohnson", "twitter": "https://twitter.com/sarahcodes", "github": "https://github.com/sarahjohnson"}'),
    ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'John Smith', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 'Passionate learner focused on web development and data science.', 'San Francisco, CA', 'Learner', '{"linkedin": "https://linkedin.com/in/johnsmith"}'),
    ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Alex Chen', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop', 'Full-stack developer interested in AI and machine learning.', 'Austin, TX', 'Learner', '{"linkedin": "https://linkedin.com/in/alexchen"}'),
    ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Sophia Martinez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 'Data scientist and machine learning enthusiast. Premium subscriber.', 'Chicago, IL', 'Learner', '{"linkedin": "https://linkedin.com/in/sophiamartinez", "github": "https://github.com/sophiam"}'),
    ('f1e2d3c4-5b6a-7089-9e8d-7c6b5a4e3d2c', 'Prof. Michael Johnson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 'Full Stack Developer with expertise in modern web technologies.', 'New York, NY', 'Creator', '{"linkedin": "https://linkedin.com/in/michaeljohnson"}'),
    ('a9b8c7d6-5e4f-3210-9876-543210fedcba', 'Emily Davis', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', 'UX/UI Designer and Frontend Developer.', 'Los Angeles, CA', 'Creator', '{"linkedin": "https://linkedin.com/in/emilydavis"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Dr. Sarah Johnson's courses
INSERT INTO courses (title, description, instructor_id, price, original_price, category, duration, level, thumbnail, status, rating, features) VALUES
    ('Advanced Machine Learning Masterclass', 'Master advanced ML algorithms and techniques used in industry', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 2499.00, 4999.00, 'Machine Learning', '40 hours', 'Advanced', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400', 'active', 4.80, '["Lifetime Access", "Certificate", "Mobile Access", "Assignments"]'),
    ('Computer Vision Fundamentals', 'Learn the basics of computer vision and image processing', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 1999.00, 3999.00, 'Computer Vision', '32 hours', 'Beginner', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', 'active', 4.90, '["Lifetime Access", "Certificate", "Mobile Access"]'),
    ('Deep Learning with TensorFlow', 'Build neural networks and deep learning models with TensorFlow', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 2999.00, 5999.00, 'Deep Learning', '45 hours', 'Intermediate', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 'active', 4.70, '["Lifetime Access", "Certificate", "Mobile Access", "Projects"]'),
    ('Natural Language Processing', 'Master NLP techniques for text analysis and generation', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 3499.00, 6999.00, 'Machine Learning', '50 hours', 'Advanced', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400', 'active', 4.85, '["Lifetime Access", "Certificate", "Projects", "1-on-1 Mentoring"]'),
    ('AI Ethics and Responsible AI', 'Understand ethical implications in AI development', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 1499.00, 2999.00, 'AI Ethics', '20 hours', 'Intermediate', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400', 'active', 4.95, '["Lifetime Access", "Certificate", "Case Studies"]');

-- Insert other instructor courses
INSERT INTO courses (title, description, instructor_id, price, original_price, category, duration, level, thumbnail, status, rating) VALUES
    ('React Complete Course 2024', 'Complete React course from beginner to advanced', 'f1e2d3c4-5b6a-7089-9e8d-7c6b5a4e3d2c', 1899.00, 3799.00, 'Web Development', '50 hours', 'Beginner', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400', 'active', 4.90),
    ('UI/UX Design Principles', 'Learn modern UI/UX design principles', 'a9b8c7d6-5e4f-3210-9876-543210fedcba', 1599.00, 3199.00, 'UI/UX Design', '30 hours', 'Beginner', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', 'active', 4.75);

-- Insert user stats
INSERT INTO user_stats (user_id, total_courses, completed_courses, in_progress_courses, total_hours, certificates, average_score, current_streak, longest_streak) VALUES
    ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 15, 12, 3, 156.5, 8, 85.5, 7, 21),
    ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 5, 3, 2, 45.0, 3, 88.0, 3, 10),
    ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 8, 6, 2, 78.5, 6, 92.0, 15, 30),
    ('d7a3c5e4-5f2b-4a8c-9e1d-3b2a1c0d9e8f', 5, 5, 0, 45.0, 3, 92.0, 3, 15)
ON CONFLICT (user_id) DO NOTHING;

-- Insert instructor stats
INSERT INTO instructor_stats (user_id, total_students, active_courses, total_revenue, average_rating, completion_rate, student_satisfaction) VALUES
    ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 3250, 5, 875000.00, 4.80, 87.50, 92.30),
    ('f1e2d3c4-5b6a-7089-9e8d-7c6b5a4e3d2c', 1892, 1, 472500.00, 4.90, 85.00, 90.50),
    ('a9b8c7d6-5e4f-3210-9876-543210fedcba', 756, 1, 125000.00, 4.75, 82.00, 88.00)
ON CONFLICT (user_id) DO NOTHING;

-- Get course IDs for enrollments
DO $$
DECLARE
    cv_course_id INTEGER;
    ml_course_id INTEGER;
    dl_course_id INTEGER;
BEGIN
    -- Get Computer Vision course ID
    SELECT id INTO cv_course_id FROM courses WHERE title = 'Computer Vision Fundamentals' LIMIT 1;
    
    -- Get Machine Learning course ID
    SELECT id INTO ml_course_id FROM courses WHERE title = 'Advanced Machine Learning Masterclass' LIMIT 1;
    
    -- Get Deep Learning course ID
    SELECT id INTO dl_course_id FROM courses WHERE title = 'Deep Learning with TensorFlow' LIMIT 1;

    -- Insert enrollments
    -- John Smith enrollments
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at) VALUES
        ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', ml_course_id, 100, 'completed', NOW() - INTERVAL '45 days'),
        ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', cv_course_id, 75, 'active', NOW() - INTERVAL '30 days'),
        ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', dl_course_id, 45, 'active', NOW() - INTERVAL '15 days')
    ON CONFLICT (user_id, course_id) DO NOTHING;

    -- Alex Chen (direct purchase student)
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at) VALUES
        ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', cv_course_id, 35, 'active', NOW() - INTERVAL '7 days')
    ON CONFLICT (user_id, course_id) DO NOTHING;

    -- Sophia Martinez (premium subscriber)
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at) VALUES
        ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', ml_course_id, 100, 'completed', NOW() - INTERVAL '60 days'),
        ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', cv_course_id, 85, 'active', NOW() - INTERVAL '20 days'),
        ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', dl_course_id, 30, 'active', NOW() - INTERVAL '5 days')
    ON CONFLICT (user_id, course_id) DO NOTHING;

    -- Insert transactions
    INSERT INTO transactions (user_id, course_id, amount, type, status, payment_method) VALUES
        ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', ml_course_id, 2499.00, 'course_purchase', 'completed', 'credit_card'),
        ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', cv_course_id, 1999.00, 'course_purchase', 'completed', 'paypal'),
        ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', dl_course_id, 2999.00, 'course_purchase', 'completed', 'credit_card'),
        ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', cv_course_id, 1999.00, 'course_purchase', 'completed', 'credit_card')
    ON CONFLICT DO NOTHING;

    -- Update course statistics
    UPDATE courses c SET
        total_students = (SELECT COUNT(DISTINCT user_id) FROM enrollments WHERE course_id = c.id),
        total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE course_id = c.id AND status = 'completed');

END $$;

-- Insert subscription for Sophia Martinez
INSERT INTO subscriptions (user_id, plan_id, status, amount, start_date, expires_at) VALUES
    ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'premium', 'active', 4999.00, NOW() - INTERVAL '25 days', NOW() + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Insert certificates
INSERT INTO certificates (id, user_id, course_id, credential_id, grade, skills) 
SELECT 
    'cert-' || md5(random()::text),
    e.user_id,
    e.course_id,
    'CERT-2024-' || LPAD(e.course_id::text, 3, '0') || '-' || SUBSTRING(e.user_id::text, 1, 4),
    'A',
    '["Machine Learning", "Deep Learning", "Python"]'
FROM enrollments e
WHERE e.status = 'completed'
ON CONFLICT (id) DO NOTHING;

-- Insert some activities
INSERT INTO activities (user_id, type, title, course_id, details) 
SELECT 
    e.user_id,
    CASE 
        WHEN e.status = 'completed' THEN 'course_completed'
        ELSE 'lesson_finished'
    END,
    CASE 
        WHEN e.status = 'completed' THEN 'Completed "' || c.title || '"'
        ELSE 'Progress in "' || c.title || '"'
    END,
    e.course_id,
    jsonb_build_object('progress', e.progress)
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LIMIT 10;