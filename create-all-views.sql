-- Create views to map lowercase tables to mixed case names that EF Core expects

-- CourseModules view
DROP VIEW IF EXISTS "CourseModules";
CREATE VIEW "CourseModules" AS 
SELECT * FROM course_modules;

-- Lessons view
DROP VIEW IF EXISTS "Lessons";
CREATE VIEW "Lessons" AS 
SELECT * FROM course_lessons;

-- Reviews view  
DROP VIEW IF EXISTS "Reviews";
CREATE VIEW "Reviews" AS 
SELECT * FROM course_reviews;

-- Enrollments view
DROP VIEW IF EXISTS "Enrollments";
CREATE VIEW "Enrollments" AS 
SELECT * FROM enrollments;