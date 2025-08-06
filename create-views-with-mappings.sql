-- Drop existing views
DROP VIEW IF EXISTS "CourseModules";
DROP VIEW IF EXISTS "Lessons";
DROP VIEW IF EXISTS "Reviews";
DROP VIEW IF EXISTS "Enrollments";

-- CourseModules view with column mappings
CREATE VIEW "CourseModules" AS 
SELECT 
    id as "Id",
    course_id as "CourseId",
    title as "Title",
    description as "Description",
    display_order as "Order",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt"
FROM course_modules;

-- Lessons view with column mappings
CREATE VIEW "Lessons" AS 
SELECT 
    id as "Id",
    module_id as "ModuleId",
    title as "Title",
    content as "Content",
    video_url as "VideoUrl",
    duration_minutes as "Duration",
    display_order as "Order",
    lesson_type as "Type",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt"
FROM course_lessons;

-- Reviews view with column mappings
CREATE VIEW "Reviews" AS 
SELECT 
    id as "Id",
    course_id as "CourseId",
    student_id as "StudentId",
    rating as "Rating",
    comment as "Comment",
    created_at as "CreatedAt",
    approved_at as "ApprovedAt",
    approved_by as "ApprovedBy",
    status as "Status",
    is_flagged as "IsFlagged"
FROM course_reviews;

-- Enrollments view with column mappings
CREATE VIEW "Enrollments" AS 
SELECT 
    id as "Id",
    student_id as "StudentId",
    course_id as "CourseId",
    enrolled_at as "EnrolledAt",
    completed_at as "CompletedAt",
    progress_percentage as "ProgressPercentage",
    last_accessed_date as "LastAccessedDate",
    certificate_issued as "CertificateIssued",
    certificate_url as "CertificateUrl",
    total_time_spent as "TotalTimeSpent",
    quiz_count as "QuizCount",
    average_quiz_score as "AverageQuizScore",
    completed_lessons as "CompletedLessons"
FROM enrollments;