-- Drop all views to use direct table access
DROP VIEW IF EXISTS "Courses" CASCADE;
DROP VIEW IF EXISTS "CourseModules" CASCADE;
DROP VIEW IF EXISTS "Lessons" CASCADE;
DROP VIEW IF EXISTS "Reviews" CASCADE;
DROP VIEW IF EXISTS "Enrollments" CASCADE;