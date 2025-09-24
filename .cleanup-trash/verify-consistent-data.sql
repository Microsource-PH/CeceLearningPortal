-- SQL queries to verify consistent data across the platform
-- Run these after seeding to ensure data integrity

-- 1. Instructor Summary with Revenue Calculations
SELECT 
    u.full_name as instructor_name,
    u.email,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT e.student_id) as unique_students,
    COALESCE(SUM(p.amount), 0) as total_revenue,
    COALESCE(SUM(p.amount) * 0.8, 0) as creator_earnings,
    COALESCE(SUM(p.amount) * 0.2, 0) as platform_share,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(DISTINCT r.id) as total_reviews
FROM "AspNetUsers" u
LEFT JOIN "Courses" c ON c.instructor_id = u.id
LEFT JOIN "Enrollments" e ON e.course_id = c.id
LEFT JOIN "Payments" p ON p.course_id = c.id AND p.user_id = e.student_id AND p.status = 0
LEFT JOIN "Reviews" r ON r.course_id = c.id
WHERE u.role = 1 -- Instructor role
GROUP BY u.id, u.full_name, u.email
ORDER BY total_revenue DESC;

-- 2. Course Performance Metrics
SELECT 
    c.title,
    u.full_name as instructor,
    c.price,
    COUNT(DISTINCT e.id) as enrollments,
    COUNT(DISTINCT p.id) as paid_enrollments,
    COALESCE(SUM(p.amount), 0) as course_revenue,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as review_count,
    ROUND(AVG(e.progress_percentage), 2) as avg_progress
FROM "Courses" c
JOIN "AspNetUsers" u ON c.instructor_id = u.id
LEFT JOIN "Enrollments" e ON e.course_id = c.id
LEFT JOIN "Payments" p ON p.course_id = c.id AND p.status = 0
LEFT JOIN "Reviews" r ON r.course_id = c.id
GROUP BY c.id, c.title, u.full_name, c.price
ORDER BY course_revenue DESC;

-- 3. Verify Payment-Enrollment Consistency
SELECT 
    'Total Enrollments' as metric, COUNT(*) as count
FROM "Enrollments"
UNION ALL
SELECT 
    'Total Course Payments', COUNT(*)
FROM "Payments" 
WHERE course_id IS NOT NULL AND status = 0
UNION ALL
SELECT 
    'Enrollments with Payment', COUNT(DISTINCT e.id)
FROM "Enrollments" e
JOIN "Payments" p ON p.course_id = e.course_id AND p.user_id = e.student_id AND p.status = 0
UNION ALL
SELECT 
    'Enrollments without Payment', COUNT(*)
FROM "Enrollments" e
WHERE NOT EXISTS (
    SELECT 1 FROM "Payments" p 
    WHERE p.course_id = e.course_id AND p.user_id = e.student_id AND p.status = 0
);

-- 4. Rating Distribution by Instructor
SELECT 
    u.full_name as instructor,
    r.rating,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY u.full_name), 2) as percentage
FROM "Reviews" r
JOIN "Courses" c ON r.course_id = c.id
JOIN "AspNetUsers" u ON c.instructor_id = u.id
GROUP BY u.full_name, r.rating
ORDER BY u.full_name, r.rating DESC;

-- 5. Monthly Revenue Trend
SELECT 
    DATE_TRUNC('month', p.created_at) as month,
    COUNT(*) as transactions,
    SUM(p.amount) as revenue,
    SUM(p.amount) * 0.8 as total_creator_earnings,
    SUM(p.amount) * 0.2 as total_platform_share
FROM "Payments" p
WHERE p.status = 0
GROUP BY DATE_TRUNC('month', p.created_at)
ORDER BY month DESC;

-- 6. Student Engagement Metrics
SELECT 
    c.title,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.progress_percentage = 100 THEN e.id END) as completed,
    COUNT(DISTINCT CASE WHEN e.progress_percentage > 0 AND e.progress_percentage < 100 THEN e.id END) as in_progress,
    COUNT(DISTINCT CASE WHEN e.progress_percentage = 0 THEN e.id END) as not_started,
    ROUND(AVG(e.progress_percentage), 2) as avg_progress,
    ROUND(COUNT(DISTINCT CASE WHEN e.progress_percentage = 100 THEN e.id END) * 100.0 / COUNT(DISTINCT e.id), 2) as completion_rate
FROM "Courses" c
LEFT JOIN "Enrollments" e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY total_enrollments DESC;

-- 7. Platform Summary
SELECT 
    (SELECT COUNT(*) FROM "AspNetUsers" WHERE role = 2) as total_students,
    (SELECT COUNT(*) FROM "AspNetUsers" WHERE role = 1) as total_instructors,
    (SELECT COUNT(*) FROM "Courses" WHERE status = 1) as active_courses,
    (SELECT COUNT(*) FROM "Enrollments") as total_enrollments,
    (SELECT COALESCE(SUM(amount), 0) FROM "Payments" WHERE status = 0) as total_revenue,
    (SELECT COALESCE(AVG(rating), 0) FROM "Reviews") as platform_avg_rating;