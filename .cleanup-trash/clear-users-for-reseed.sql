-- Clear all user-related data to allow proper reseeding
DELETE FROM "AspNetUserRoles";
DELETE FROM "AspNetUserClaims";
DELETE FROM "AspNetUserLogins";
DELETE FROM "AspNetUserTokens";
DELETE FROM "AspNetUsers";

-- Also clear any data that depends on users
DELETE FROM enrollments;
DELETE FROM course_reviews;
DELETE FROM lesson_progress;
DELETE FROM transactions;
DELETE FROM subscriptions;
DELETE FROM activities;
DELETE FROM refresh_tokens;
DELETE FROM sessions;
DELETE FROM instructor_approvals;
DELETE FROM course_approvals;