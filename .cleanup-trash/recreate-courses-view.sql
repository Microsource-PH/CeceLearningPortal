-- Drop the old view if it exists
DROP VIEW IF EXISTS "Courses";

-- Create a new view that includes all columns from the courses table
CREATE VIEW "Courses" AS 
SELECT * FROM courses;