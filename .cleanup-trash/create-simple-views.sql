-- Create simple views that map lowercase tables to mixed case
DROP VIEW IF EXISTS "Courses" CASCADE;
DROP VIEW IF EXISTS "CourseModules" CASCADE;
DROP VIEW IF EXISTS "Lessons" CASCADE;
DROP VIEW IF EXISTS "Reviews" CASCADE;
DROP VIEW IF EXISTS "Enrollments" CASCADE;

-- Simple Courses view
CREATE VIEW "Courses" AS SELECT * FROM courses;

-- Simple CourseModules view
CREATE VIEW "CourseModules" AS SELECT * FROM course_modules;

-- Simple Lessons view
CREATE VIEW "Lessons" AS SELECT * FROM course_lessons;

-- Simple Reviews view
CREATE VIEW "Reviews" AS SELECT * FROM course_reviews;

-- Simple Enrollments view
CREATE VIEW "Enrollments" AS SELECT * FROM enrollments;