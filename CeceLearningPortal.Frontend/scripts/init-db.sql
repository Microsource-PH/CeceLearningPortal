-- Simple initialization script for Cece Learning Portal
-- Run this in Supabase SQL Editor or psql

-- Clear existing data (optional - comment out if you want to keep existing data)
TRUNCATE auth.users CASCADE;
TRUNCATE public.profiles CASCADE;
TRUNCATE public.courses CASCADE;

-- Insert users (password is 'password' hashed with bcrypt)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
  ('d7a3c5e4-5f2b-4a8c-9e1d-3b2a1c0d9e8f', 'admin@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy', now(), now(), now()),
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'instructor@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy', now(), now(), now()),
  ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'student@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert profiles
INSERT INTO public.profiles (id, full_name, avatar_url, bio, location, role, status, created_at, updated_at) VALUES
  ('d7a3c5e4-5f2b-4a8c-9e1d-3b2a1c0d9e8f', 'Michael Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Platform administrator', 'Seattle, WA', 'Admin', 'Active', now(), now()),
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Dr. Sarah Johnson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Senior Software Engineer', 'New York, NY', 'Creator', 'Active', now(), now()),
  ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'John Smith', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Passionate learner', 'San Francisco, CA', 'Learner', 'Active', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert courses for Dr. Johnson
INSERT INTO public.courses (title, description, instructor_id, price, original_price, category, duration, level, thumbnail, status, rating, created_at) VALUES
  ('Advanced Machine Learning', 'Master ML algorithms', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 2499, 4999, 'Machine Learning', '40 hours', 'Advanced', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400', 'active', 4.8, now()),
  ('Computer Vision Fundamentals', 'Learn computer vision basics', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 1999, 3999, 'Computer Vision', '32 hours', 'Beginner', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', 'active', 4.9, now()),
  ('Deep Learning with TensorFlow', 'Build neural networks', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 2999, 5999, 'Deep Learning', '45 hours', 'Intermediate', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 'active', 4.7, now())
ON CONFLICT DO NOTHING;

-- Insert user stats
INSERT INTO public.user_stats (user_id, total_courses, completed_courses, in_progress_courses, total_hours, certificates, average_score, current_streak, longest_streak) VALUES
  ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 15, 12, 3, 156.5, 8, 85.5, 7, 21)
ON CONFLICT (user_id) DO NOTHING;

-- Insert instructor stats
INSERT INTO public.instructor_stats (user_id, total_students, active_courses, total_revenue, average_rating, completion_rate, student_satisfaction) VALUES
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 3250, 3, 875000.00, 4.80, 87.50, 92.30)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the data
SELECT 'Users created:' as status, count(*) as count FROM auth.users;
SELECT 'Profiles created:' as status, count(*) as count FROM public.profiles;
SELECT 'Courses created:' as status, count(*) as count FROM public.courses;

-- Display login credentials
SELECT 'Login Credentials:' as info
UNION ALL
SELECT '- admin@example.com / password' as info
UNION ALL
SELECT '- instructor@example.com / password' as info  
UNION ALL
SELECT '- student@example.com / password' as info;