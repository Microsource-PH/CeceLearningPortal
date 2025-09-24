-- SQL queries to verify Dr. Sarah Johnson's data in the database
-- Run these against your PostgreSQL database

-- 1. Find Dr. Sarah Johnson's user ID
SELECT id, full_name, email, role 
FROM "AspNetUsers" 
WHERE email = 'instructor@example.com';

-- 2. Check her courses
SELECT c.id, c.title, c.price, c.instructor_id, 
       (SELECT COUNT(*) FROM "Enrollments" WHERE course_id = c.id) as student_count
FROM "Courses" c
WHERE c.instructor_id = (SELECT id FROM "AspNetUsers" WHERE email = 'instructor@example.com');

-- 3. Check payments for her courses
SELECT p.id, p.amount, p.status, p.course_id, c.title, c.instructor_id
FROM "Payments" p
JOIN "Courses" c ON p.course_id = c.id
WHERE c.instructor_id = (SELECT id FROM "AspNetUsers" WHERE email = 'instructor@example.com')
  AND p.status = 0; -- 0 = Completed status

-- 4. Calculate her total revenue
SELECT 
    COUNT(DISTINCT p.id) as payment_count,
    SUM(p.amount) as total_revenue,
    SUM(p.amount) * 0.8 as creator_earnings,
    SUM(p.amount) * 0.2 as platform_share
FROM "Payments" p
JOIN "Courses" c ON p.course_id = c.id
WHERE c.instructor_id = (SELECT id FROM "AspNetUsers" WHERE email = 'instructor@example.com')
  AND p.status = 0;

-- 5. Check enrollments for her courses
SELECT c.title, COUNT(e.id) as enrollment_count
FROM "Courses" c
LEFT JOIN "Enrollments" e ON c.id = e.course_id
WHERE c.instructor_id = (SELECT id FROM "AspNetUsers" WHERE email = 'instructor@example.com')
GROUP BY c.id, c.title;

-- 6. Check reviews for her courses
SELECT c.title, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
FROM "Courses" c
LEFT JOIN "Reviews" r ON c.id = r.course_id
WHERE c.instructor_id = (SELECT id FROM "AspNetUsers" WHERE email = 'instructor@example.com')
GROUP BY c.id, c.title;