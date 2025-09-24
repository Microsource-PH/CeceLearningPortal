-- Drop all existing views
DROP VIEW IF EXISTS "Courses" CASCADE;
DROP VIEW IF EXISTS "CourseModules" CASCADE;
DROP VIEW IF EXISTS "Lessons" CASCADE;
DROP VIEW IF EXISTS "Reviews" CASCADE;
DROP VIEW IF EXISTS "Enrollments" CASCADE;
DROP VIEW IF EXISTS "AspNetUsers" CASCADE;
DROP VIEW IF EXISTS "AspNetRoles" CASCADE;
DROP VIEW IF EXISTS "AspNetUserRoles" CASCADE;
DROP VIEW IF EXISTS "Payments" CASCADE;
DROP VIEW IF EXISTS "Subscriptions" CASCADE;
DROP VIEW IF EXISTS "SubscriptionPlans" CASCADE;
DROP VIEW IF EXISTS "Notifications" CASCADE;
DROP VIEW IF EXISTS "RefreshTokens" CASCADE;
DROP VIEW IF EXISTS "LessonProgresses" CASCADE;

-- Create AspNetUsers view for Identity
CREATE VIEW "AspNetUsers" AS
SELECT 
    CAST(id AS TEXT) as "Id",
    email as "Email",
    UPPER(email) as "NormalizedEmail",
    email as "UserName",
    UPPER(email) as "NormalizedUserName",
    true as "EmailConfirmed",
    password_hash as "PasswordHash",
    '' as "SecurityStamp",
    '' as "ConcurrencyStamp",
    NULL::text as "PhoneNumber",
    false as "PhoneNumberConfirmed",
    false as "TwoFactorEnabled",
    NULL::timestamptz as "LockoutEnd",
    true as "LockoutEnabled",
    0 as "AccessFailedCount",
    COALESCE(full_name, email) as "FullName",
    avatar_url as "Avatar",
    COALESCE(role, 'Student') as "Role",
    'Active' as "Status",
    created_at as "CreatedAt",
    last_login_at as "LastLoginAt",
    NULL::text as "RefreshToken",
    NULL::timestamptz as "RefreshTokenExpiryTime",
    '{"email":true,"sms":false}' as "NotificationPreferences"
FROM users;

-- Create AspNetRoles view (if needed)
CREATE VIEW "AspNetRoles" AS
SELECT 
    role::text as "Id",
    role as "Name",
    UPPER(role) as "NormalizedName",
    '' as "ConcurrencyStamp"
FROM (VALUES ('Admin'), ('Instructor'), ('Student')) AS roles(role);

-- Create AspNetUserRoles view
CREATE VIEW "AspNetUserRoles" AS
SELECT 
    CAST(id AS TEXT) as "UserId",
    COALESCE(role, 'Student')::text as "RoleId"
FROM users;

-- Create Courses view with all required columns
CREATE VIEW "Courses" AS
SELECT 
    id as "Id",
    title as "Title",
    description as "Description",
    COALESCE("ShortDescription", seo_description, SUBSTRING(description, 1, 200)) as "ShortDescription",
    CAST(instructor_id AS TEXT) as "InstructorId",
    price as "Price",
    original_price as "OriginalPrice",
    NULL::integer as "Discount",
    duration as "Duration",
    COALESCE(level, 'Beginner') as "Level",
    category as "Category",
    thumbnail as "Thumbnail",
    NULL::text as "ThumbnailUrl",
    "PromoVideoUrl",
    COALESCE(status, 'Active') as "Status",
    is_bestseller as "IsBestseller",
    COALESCE(features, '[]'::jsonb) as "Features",
    NULL::text as "PreviewUrl",
    'OneTime' as "EnrollmentType",
    COALESCE("IsPublished", is_published, true) as "IsPublished",
    COALESCE("PublishedAt", approved_at, created_at) as "PublishedAt",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt",
    COALESCE("CourseType", course_type, 3) as "CourseType",
    COALESCE("PricingModel", 1) as "PricingModel",
    COALESCE("Currency", 'PHP') as "Currency",
    "SubscriptionPeriod",
    "PaymentPlanDetailsJson",
    COALESCE("AccessType", 0) as "AccessType",
    "AccessDuration",
    COALESCE("EnrollmentLimit", enrollment_limit) as "EnrollmentLimit",
    COALESCE("Language", language, 'en') as "Language",
    COALESCE("HasCertificate", false) as "HasCertificate",
    COALESCE("HasCommunity", false) as "HasCommunity",
    COALESCE("HasLiveSessions", false) as "HasLiveSessions",
    COALESCE("HasDownloadableResources", false) as "HasDownloadableResources",
    COALESCE("HasAssignments", false) as "HasAssignments",
    COALESCE("HasQuizzes", false) as "HasQuizzes",
    COALESCE("DripContent", false) as "DripContent",
    "DripScheduleJson",
    COALESCE("AutomationWelcomeEmail", true) as "AutomationWelcomeEmail",
    COALESCE("AutomationCompletionCertificate", true) as "AutomationCompletionCertificate",
    COALESCE("AutomationProgressReminders", true) as "AutomationProgressReminders",
    COALESCE("AutomationAbandonmentSequence", false) as "AutomationAbandonmentSequence"
FROM courses;

-- Create CourseModules view
CREATE VIEW "CourseModules" AS
SELECT 
    id as "Id",
    course_id as "CourseId",
    title as "Title",
    description as "Description",
    COALESCE(display_order, 0) as "Order",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt"
FROM course_modules;

-- Create Lessons view
CREATE VIEW "Lessons" AS
SELECT 
    id as "Id",
    module_id as "ModuleId",
    title as "Title",
    description as "Content",
    content_url as "VideoUrl",
    COALESCE(duration_minutes, 0) as "Duration",
    COALESCE(display_order, 0) as "Order",
    COALESCE(content_type, 'Video') as "Type",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt"
FROM course_lessons;

-- Create Reviews view
CREATE VIEW "Reviews" AS
SELECT 
    id as "Id",
    course_id as "CourseId",
    CAST(user_id AS TEXT) as "StudentId",
    rating as "Rating",
    comment as "Comment",
    created_at as "CreatedAt",
    NULL::timestamptz as "ApprovedAt",
    NULL::text as "ApprovedBy",
    'Approved' as "Status",
    false as "IsFlagged"
FROM course_reviews;

-- Create Enrollments view
CREATE VIEW "Enrollments" AS
SELECT 
    id as "Id",
    CAST(user_id AS TEXT) as "StudentId",
    course_id as "CourseId",
    COALESCE(enrolled_at, created_at) as "EnrolledAt",
    completed_at as "CompletedAt",
    COALESCE(progress, 0) as "ProgressPercentage",
    updated_at as "LastAccessedDate",
    false as "CertificateIssued",
    NULL::text as "CertificateUrl",
    0 as "TotalTimeSpent",
    0 as "QuizCount",
    0.0 as "AverageQuizScore",
    0 as "CompletedLessons"
FROM enrollments;

-- Create LessonProgresses view
CREATE VIEW "LessonProgresses" AS
SELECT 
    id as "Id",
    CAST(user_id AS TEXT) as "StudentId",
    lesson_id as "LessonId",
    CASE 
        WHEN completed THEN 'Completed'
        ELSE 'InProgress'
    END as "Status",
    completed_at as "CompletedAt",
    0 as "TimeSpent",
    0.0 as "QuizScore",
    created_at as "StartedAt",
    updated_at as "UpdatedAt"
FROM lesson_progress;

-- Create Payments view
CREATE VIEW "Payments" AS
SELECT 
    id as "Id",
    CAST(user_id AS TEXT) as "UserId",
    course_id as "CourseId",
    amount as "Amount",
    'PHP' as "Currency",
    'CreditCard' as "PaymentMethod",
    transaction_id as "TransactionId",
    'Completed' as "Status",
    created_at as "CreatedAt"
FROM transactions
WHERE course_id IS NOT NULL;

-- Create Subscriptions view
CREATE VIEW "Subscriptions" AS
SELECT 
    id as "Id",
    CAST(user_id AS TEXT) as "UserId",
    plan_id as "PlanId",
    status as "Status",
    start_date as "StartDate",
    end_date as "EndDate",
    false as "AutoRenew",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt"
FROM subscriptions;

-- Create SubscriptionPlans view
CREATE VIEW "SubscriptionPlans" AS
SELECT 
    id as "Id",
    name as "Name",
    description as "Description",
    price as "Price",
    duration_months as "DurationInMonths",
    features as "Features",
    is_active as "IsActive",
    created_at as "CreatedAt",
    updated_at as "UpdatedAt",
    0 as "PlanType",
    NULL::integer as "MaxCoursesCanCreate",
    NULL::integer as "MaxStudentsPerCourse",
    0 as "DisplayOrder",
    false as "IsRecommended",
    false as "HasAnalytics",
    false as "HasPrioritySupport",
    0.0 as "TransactionFeePercentage"
FROM subscription_plans;

-- Create RefreshTokens view  
CREATE VIEW "RefreshTokens" AS
SELECT 
    id as "Id",
    CAST(user_id AS TEXT) as "UserId",
    token as "Token",
    expires_at as "ExpiresAt",
    created_at as "CreatedAt",
    false as "IsRevoked",
    NULL::timestamptz as "RevokedAt"
FROM refresh_tokens;

-- Create Notifications view
CREATE VIEW "Notifications" AS
SELECT 
    id as "Id",
    CAST(user_id AS TEXT) as "UserId",
    title as "Title",
    description as "Message",
    activity_type as "Type",
    false as "IsRead",
    created_at as "CreatedAt"
FROM activities;