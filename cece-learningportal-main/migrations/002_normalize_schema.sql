-- Normalize database schema for one-to-many relationships
-- This migration converts JSONB columns to proper relational tables

-- Create course_features table for one-to-many relationship
CREATE TABLE IF NOT EXISTS course_features (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    feature VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, feature)
);

-- Create course_tags table for categorization
CREATE TABLE IF NOT EXISTS course_tags (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, tag)
);

-- Create course_prerequisites table
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    prerequisite_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (prerequisite_course_id IS NOT NULL OR prerequisite_text IS NOT NULL)
);

-- Create course_objectives table (learning objectives/outcomes)
CREATE TABLE IF NOT EXISTS course_objectives (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    objective TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course_instructors table (for co-instructors)
CREATE TABLE IF NOT EXISTS course_instructors (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'co-instructor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, instructor_id)
);

-- Create course_modules table (course structure)
CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course_lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'quiz', 'assignment', 'resource')),
    content_url TEXT,
    duration_minutes INTEGER,
    display_order INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

-- Create course_resources table
CREATE TABLE IF NOT EXISTS course_resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) CHECK (resource_type IN ('pdf', 'video', 'link', 'download', 'external')),
    resource_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course_reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id)
);

-- Create review_responses table (for instructor responses)
CREATE TABLE IF NOT EXISTS review_responses (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES course_reviews(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id),
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id)
);

-- Create course_announcements table
CREATE TABLE IF NOT EXISTS course_announcements (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course_categories table (for hierarchical categories)
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES course_categories(id) ON DELETE SET NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course_type enum and add to courses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_type') THEN
        CREATE TYPE course_type AS ENUM ('Sprint', 'Marathon', 'Membership', 'Custom');
    END IF;
END$$;

-- Create certificate_skills table (normalize skills from certificates)
CREATE TABLE IF NOT EXISTS certificate_skills (
    id SERIAL PRIMARY KEY,
    certificate_id VARCHAR(50) NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(certificate_id, skill)
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL,
    proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill)
);

-- Create profile_social_links table (normalize social_links from profiles)
CREATE TABLE IF NOT EXISTS profile_social_links (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, platform)
);

-- Add new columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS course_type course_type DEFAULT 'Custom',
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES course_categories(id),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enrollment_limit INTEGER,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS subtitle_languages TEXT[], -- Array of available subtitle languages
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create indexes for new tables
CREATE INDEX idx_course_features_course ON course_features(course_id);
CREATE INDEX idx_course_tags_course ON course_tags(course_id);
CREATE INDEX idx_course_tags_tag ON course_tags(tag);
CREATE INDEX idx_course_prerequisites_course ON course_prerequisites(course_id);
CREATE INDEX idx_course_objectives_course ON course_objectives(course_id);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_course_resources_course ON course_resources(course_id);
CREATE INDEX idx_course_resources_lesson ON course_resources(lesson_id);
CREATE INDEX idx_course_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX idx_review_responses_review ON review_responses(review_id);
CREATE INDEX idx_course_announcements_course ON course_announcements(course_id);
CREATE INDEX idx_course_categories_parent ON course_categories(parent_id);
CREATE INDEX idx_certificate_skills_certificate ON certificate_skills(certificate_id);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_profile_social_links_profile ON profile_social_links(profile_id);

-- Add triggers for updated_at on new tables
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON course_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_announcements_updated_at BEFORE UPDATE ON course_announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration functions to move data from JSONB to normalized tables
-- These should be run after the tables are created

-- Migrate features from JSONB to course_features table
DO $$
DECLARE
    course_record RECORD;
    feature_text TEXT;
    feature_order INTEGER;
BEGIN
    FOR course_record IN SELECT id, features FROM courses WHERE features IS NOT NULL
    LOOP
        feature_order := 0;
        FOR feature_text IN SELECT jsonb_array_elements_text(course_record.features)
        LOOP
            INSERT INTO course_features (course_id, feature, display_order)
            VALUES (course_record.id, feature_text, feature_order)
            ON CONFLICT (course_id, feature) DO NOTHING;
            feature_order := feature_order + 1;
        END LOOP;
    END LOOP;
END $$;

-- Migrate skills from certificates JSONB to certificate_skills table
DO $$
DECLARE
    cert_record RECORD;
    skill_text TEXT;
BEGIN
    FOR cert_record IN SELECT id, skills FROM certificates WHERE skills IS NOT NULL
    LOOP
        FOR skill_text IN SELECT jsonb_array_elements_text(cert_record.skills)
        LOOP
            INSERT INTO certificate_skills (certificate_id, skill)
            VALUES (cert_record.id, skill_text)
            ON CONFLICT (certificate_id, skill) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Migrate social_links from profiles JSONB to profile_social_links table
DO $$
DECLARE
    profile_record RECORD;
    social_key TEXT;
    social_value TEXT;
BEGIN
    FOR profile_record IN SELECT id, social_links FROM profiles WHERE social_links IS NOT NULL
    LOOP
        FOR social_key, social_value IN SELECT key, value::text FROM jsonb_each(profile_record.social_links)
        LOOP
            INSERT INTO profile_social_links (profile_id, platform, url)
            VALUES (profile_record.id, social_key, trim(both '"' from social_value))
            ON CONFLICT (profile_id, platform) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- After migration, you can optionally remove the JSONB columns
-- ALTER TABLE courses DROP COLUMN features;
-- ALTER TABLE certificates DROP COLUMN skills;
-- ALTER TABLE profiles DROP COLUMN social_links;

-- Insert default course categories
INSERT INTO course_categories (name, slug, description, display_order) VALUES
('Web Development', 'web-development', 'Learn to build modern web applications', 1),
('Programming', 'programming', 'Master programming languages and concepts', 2),
('Data Science', 'data-science', 'Analyze data and build ML models', 3),
('Machine Learning', 'machine-learning', 'Deep dive into AI and ML algorithms', 4),
('Computer Vision', 'computer-vision', 'Image processing and computer vision techniques', 5),
('Mobile Development', 'mobile-development', 'Build iOS and Android applications', 6),
('Cloud Computing', 'cloud-computing', 'Master cloud platforms and services', 7),
('DevOps', 'devops', 'CI/CD, containerization, and infrastructure', 8),
('Cybersecurity', 'cybersecurity', 'Secure systems and ethical hacking', 9),
('Database', 'database', 'SQL, NoSQL, and database design', 10)
ON CONFLICT (name) DO NOTHING;

-- Add some subcategories
INSERT INTO course_categories (name, slug, parent_id, description, display_order) 
SELECT 'React', 'react', id, 'React.js framework and ecosystem', 1 FROM course_categories WHERE slug = 'web-development'
ON CONFLICT (name) DO NOTHING;

INSERT INTO course_categories (name, slug, parent_id, description, display_order) 
SELECT 'Python', 'python', id, 'Python programming language', 1 FROM course_categories WHERE slug = 'programming'
ON CONFLICT (name) DO NOTHING;

INSERT INTO course_categories (name, slug, parent_id, description, display_order) 
SELECT 'TensorFlow', 'tensorflow', id, 'TensorFlow framework for ML', 1 FROM course_categories WHERE slug = 'machine-learning'
ON CONFLICT (name) DO NOTHING;