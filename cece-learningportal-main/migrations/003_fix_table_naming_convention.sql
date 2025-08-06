-- Migration to fix table naming convention
-- Convert all table names to lowercase for consistency

-- First, let's check what tables exist and their exact names
DO $$ 
BEGIN
    -- Rename tables from PascalCase to lowercase if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Users' AND table_schema = 'public') THEN
        ALTER TABLE "Users" RENAME TO users_temp;
        ALTER TABLE users_temp RENAME TO users;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Profiles' AND table_schema = 'public') THEN
        ALTER TABLE "Profiles" RENAME TO profiles_temp;
        ALTER TABLE profiles_temp RENAME TO profiles;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Courses' AND table_schema = 'public') THEN
        ALTER TABLE "Courses" RENAME TO courses_temp;
        ALTER TABLE courses_temp RENAME TO courses;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Enrollments' AND table_schema = 'public') THEN
        ALTER TABLE "Enrollments" RENAME TO enrollments_temp;
        ALTER TABLE enrollments_temp RENAME TO enrollments;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Transactions' AND table_schema = 'public') THEN
        ALTER TABLE "Transactions" RENAME TO transactions_temp;
        ALTER TABLE transactions_temp RENAME TO transactions;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Sessions' AND table_schema = 'public') THEN
        ALTER TABLE "Sessions" RENAME TO sessions_temp;
        ALTER TABLE sessions_temp RENAME TO sessions;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Subscriptions' AND table_schema = 'public') THEN
        ALTER TABLE "Subscriptions" RENAME TO subscriptions_temp;
        ALTER TABLE subscriptions_temp RENAME TO subscriptions;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseFeatures' AND table_schema = 'public') THEN
        ALTER TABLE "CourseFeatures" RENAME TO course_features_temp;
        ALTER TABLE course_features_temp RENAME TO course_features;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseTags' AND table_schema = 'public') THEN
        ALTER TABLE "CourseTags" RENAME TO course_tags_temp;
        ALTER TABLE course_tags_temp RENAME TO course_tags;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseObjectives' AND table_schema = 'public') THEN
        ALTER TABLE "CourseObjectives" RENAME TO course_objectives_temp;
        ALTER TABLE course_objectives_temp RENAME TO course_objectives;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CoursePrerequisites' AND table_schema = 'public') THEN
        ALTER TABLE "CoursePrerequisites" RENAME TO course_prerequisites_temp;
        ALTER TABLE course_prerequisites_temp RENAME TO course_prerequisites;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseModules' AND table_schema = 'public') THEN
        ALTER TABLE "CourseModules" RENAME TO course_modules_temp;
        ALTER TABLE course_modules_temp RENAME TO course_modules;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseLessons' AND table_schema = 'public') THEN
        ALTER TABLE "CourseLessons" RENAME TO course_lessons_temp;
        ALTER TABLE course_lessons_temp RENAME TO course_lessons;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'LessonProgress' AND table_schema = 'public') THEN
        ALTER TABLE "LessonProgress" RENAME TO lesson_progress_temp;
        ALTER TABLE lesson_progress_temp RENAME TO lesson_progress;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseReviews' AND table_schema = 'public') THEN
        ALTER TABLE "CourseReviews" RENAME TO course_reviews_temp;
        ALTER TABLE course_reviews_temp RENAME TO course_reviews;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ReviewResponses' AND table_schema = 'public') THEN
        ALTER TABLE "ReviewResponses" RENAME TO review_responses_temp;
        ALTER TABLE review_responses_temp RENAME TO review_responses;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseAnnouncements' AND table_schema = 'public') THEN
        ALTER TABLE "CourseAnnouncements" RENAME TO course_announcements_temp;
        ALTER TABLE course_announcements_temp RENAME TO course_announcements;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseResources' AND table_schema = 'public') THEN
        ALTER TABLE "CourseResources" RENAME TO course_resources_temp;
        ALTER TABLE course_resources_temp RENAME TO course_resources;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseCategories' AND table_schema = 'public') THEN
        ALTER TABLE "CourseCategories" RENAME TO course_categories_temp;
        ALTER TABLE course_categories_temp RENAME TO course_categories;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CourseInstructors' AND table_schema = 'public') THEN
        ALTER TABLE "CourseInstructors" RENAME TO course_instructors_temp;
        ALTER TABLE course_instructors_temp RENAME TO course_instructors;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ProfileSocialLinks' AND table_schema = 'public') THEN
        ALTER TABLE "ProfileSocialLinks" RENAME TO profile_social_links_temp;
        ALTER TABLE profile_social_links_temp RENAME TO profile_social_links;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'UserSkills' AND table_schema = 'public') THEN
        ALTER TABLE "UserSkills" RENAME TO user_skills_temp;
        ALTER TABLE user_skills_temp RENAME TO user_skills;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Certificates' AND table_schema = 'public') THEN
        ALTER TABLE "Certificates" RENAME TO certificates_temp;
        ALTER TABLE certificates_temp RENAME TO certificates;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CertificateSkills' AND table_schema = 'public') THEN
        ALTER TABLE "CertificateSkills" RENAME TO certificate_skills_temp;
        ALTER TABLE certificate_skills_temp RENAME TO certificate_skills;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'LearningActivities' AND table_schema = 'public') THEN
        ALTER TABLE "LearningActivities" RENAME TO learning_activities_temp;
        ALTER TABLE learning_activities_temp RENAME TO learning_activities;
    END IF;

    -- Add any other tables that might have mixed case names
END $$;

-- Now let's also ensure all column names are lowercase (PostgreSQL usually handles this automatically)
-- But we should check for any quoted column names that might be case-sensitive

-- Display current table names for verification
SELECT 
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Create a function to help with consistent naming going forward
CREATE OR REPLACE FUNCTION ensure_lowercase_identifier(identifier text)
RETURNS text AS $$
BEGIN
    RETURN lower(identifier);
END;
$$ LANGUAGE plpgsql;

-- Add comment to database about naming convention
COMMENT ON DATABASE "CeceLearningPortal" IS 'Database uses lowercase_snake_case naming convention for all tables and columns';