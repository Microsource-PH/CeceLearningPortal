-- Seed data for Creator Sarah Johnson with realistic analytics and earnings data
-- This script creates comprehensive data to display in the marketplace analytics

-- First, ensure Sarah Johnson exists as an instructor
DECLARE @SarahId NVARCHAR(450);
DECLARE @StudentId1 NVARCHAR(450);
DECLARE @StudentId2 NVARCHAR(450);
DECLARE @StudentId3 NVARCHAR(450);
DECLARE @CourseId1 INT;
DECLARE @CourseId2 INT;

-- Get or create Sarah Johnson
IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'sarah.johnson@example.com')
BEGIN
    SET @SarahId = NEWID();
    INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, 
        PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed, 
        TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount, FullName, Role, CreatedAt)
    VALUES 
    (@SarahId, 'sarah.johnson@example.com', 'SARAH.JOHNSON@EXAMPLE.COM', 
     'sarah.johnson@example.com', 'SARAH.JOHNSON@EXAMPLE.COM', 1,
     'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==', -- Password: Creator123!
     NEWID(), NEWID(), '+1234567890', 0, 0, NULL, 1, 0,
     'Dr. Sarah Johnson', 2, DATEADD(MONTH, -12, GETDATE())); -- Instructor role
END
ELSE
BEGIN
    SELECT @SarahId = Id FROM AspNetUsers WHERE Email = 'sarah.johnson@example.com';
    UPDATE AspNetUsers SET Role = 2 WHERE Id = @SarahId; -- Ensure she's an instructor
END

-- Create some test students if they don't exist
SET @StudentId1 = NEWID();
SET @StudentId2 = NEWID();
SET @StudentId3 = NEWID();

INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, 
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed, 
    TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount, FullName, Role, CreatedAt)
VALUES 
(@StudentId1, 'john.doe@example.com', 'JOHN.DOE@EXAMPLE.COM', 
 'john.doe@example.com', 'JOHN.DOE@EXAMPLE.COM', 1,
 'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==',
 NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0,
 'John Doe', 1, DATEADD(MONTH, -10, GETDATE())),
 
(@StudentId2, 'jane.smith@example.com', 'JANE.SMITH@EXAMPLE.COM', 
 'jane.smith@example.com', 'JANE.SMITH@EXAMPLE.COM', 1,
 'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==',
 NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0,
 'Jane Smith', 1, DATEADD(MONTH, -8, GETDATE())),
 
(@StudentId3, 'mike.wilson@example.com', 'MIKE.WILSON@EXAMPLE.COM', 
 'mike.wilson@example.com', 'MIKE.WILSON@EXAMPLE.COM', 1,
 'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==',
 NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0,
 'Mike Wilson', 1, DATEADD(MONTH, -6, GETDATE()));

-- Delete existing courses for Sarah to start fresh
DELETE FROM LessonProgress WHERE Enrollment_EnrollmentId IN 
    (SELECT Id FROM Enrollments WHERE CourseId IN 
        (SELECT Id FROM Courses WHERE InstructorId = @SarahId));
DELETE FROM Reviews WHERE CourseId IN (SELECT Id FROM Courses WHERE InstructorId = @SarahId);
DELETE FROM Payments WHERE CourseId IN (SELECT Id FROM Courses WHERE InstructorId = @SarahId);
DELETE FROM Enrollments WHERE CourseId IN (SELECT Id FROM Courses WHERE InstructorId = @SarahId);
DELETE FROM Lessons WHERE ModuleId IN (SELECT Id FROM CourseModules WHERE CourseId IN 
    (SELECT Id FROM Courses WHERE InstructorId = @SarahId));
DELETE FROM CourseModules WHERE CourseId IN (SELECT Id FROM Courses WHERE InstructorId = @SarahId);
DELETE FROM Courses WHERE InstructorId = @SarahId;

-- Create Course 1: Advanced React Patterns & Performance
INSERT INTO Courses (Title, Description, Category, Level, Price, Status, InstructorId, 
    Duration, Language, PreviewVideoUrl, ThumbnailUrl, LearningObjectives, Requirements, 
    CreatedAt, UpdatedAt)
VALUES 
('Advanced React Patterns & Performance', 
 'Master advanced React concepts including hooks, context, performance optimization, and architectural patterns. Learn from real-world examples and build scalable applications.',
 'Web Development', 2, 4499.00, 1, @SarahId,
 '8 hours', 'English', 
 'https://example.com/preview/react-advanced',
 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format',
 '[
   "Master React Hooks and Custom Hooks",
   "Implement Context API effectively",
   "Optimize React performance",
   "Build scalable component architecture",
   "Handle complex state management",
   "Implement advanced patterns"
 ]',
 '[
   "Solid understanding of React basics",
   "JavaScript ES6+ knowledge",
   "Basic understanding of state management"
 ]',
 DATEADD(MONTH, -6, GETDATE()),
 GETDATE());

SET @CourseId1 = SCOPE_IDENTITY();

-- Create Course 2: JavaScript Fundamentals for Beginners
INSERT INTO Courses (Title, Description, Category, Level, Price, Status, InstructorId, 
    Duration, Language, PreviewVideoUrl, ThumbnailUrl, LearningObjectives, Requirements, 
    CreatedAt, UpdatedAt)
VALUES 
('JavaScript Fundamentals for Beginners', 
 'Learn JavaScript from scratch with hands-on projects and real-world examples. Perfect for beginners who want to start their web development journey.',
 'Programming', 0, 2999.00, 1, @SarahId,
 '12 hours', 'English', 
 'https://example.com/preview/js-fundamentals',
 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop&auto=format',
 '[
   "Understand JavaScript basics",
   "Work with variables and data types",
   "Master functions and objects",
   "Handle arrays and loops",
   "Understand DOM manipulation",
   "Build interactive web pages"
 ]',
 '[
   "Basic computer skills",
   "No programming experience required"
 ]',
 DATEADD(MONTH, -4, GETDATE()),
 GETDATE());

SET @CourseId2 = SCOPE_IDENTITY();

-- Create modules for Course 1
INSERT INTO CourseModules (CourseId, Title, [Order], Description)
VALUES 
(@CourseId1, 'Introduction to Advanced React', 1, 'Overview of advanced React concepts'),
(@CourseId1, 'React Hooks Deep Dive', 2, 'Master all React hooks including custom hooks'),
(@CourseId1, 'Performance Optimization', 3, 'Learn to optimize React applications'),
(@CourseId1, 'Advanced Patterns', 4, 'Implement advanced React patterns');

-- Create modules for Course 2
INSERT INTO CourseModules (CourseId, Title, [Order], Description)
VALUES 
(@CourseId2, 'JavaScript Basics', 1, 'Introduction to JavaScript programming'),
(@CourseId2, 'Functions and Objects', 2, 'Understanding functions and object-oriented programming'),
(@CourseId2, 'Working with the DOM', 3, 'Manipulating web pages with JavaScript');

-- Create realistic enrollments and payments over the past 6 months
DECLARE @EnrollmentDate DATETIME;
DECLARE @EnrollmentId INT;
DECLARE @i INT = 1;

-- Course 1 enrollments (more popular course)
WHILE @i <= 50
BEGIN
    -- Random date in the last 6 months
    SET @EnrollmentDate = DATEADD(DAY, -RAND() * 180, GETDATE());
    
    -- Insert enrollment
    INSERT INTO Enrollments (StudentId, CourseId, EnrolledAt, ProgressPercentage, CompletedAt, CertificateUrl)
    VALUES 
    ((CASE WHEN @i % 3 = 0 THEN @StudentId1 WHEN @i % 3 = 1 THEN @StudentId2 ELSE @StudentId3 END),
     @CourseId1, 
     @EnrollmentDate,
     CASE WHEN @i <= 20 THEN 100 -- 20 completed
          WHEN @i <= 40 THEN 30 + RAND() * 60 -- 20 in progress
          ELSE 0 -- 10 not started
     END,
     CASE WHEN @i <= 20 THEN DATEADD(DAY, 30, @EnrollmentDate) ELSE NULL END,
     CASE WHEN @i <= 20 THEN 'https://example.com/certificate/' + CAST(NEWID() AS VARCHAR(50)) ELSE NULL END);
    
    SET @EnrollmentId = SCOPE_IDENTITY();
    
    -- Insert payment
    INSERT INTO Payments (UserId, CourseId, Amount, Currency, Status, PaymentMethod, 
        TransactionId, Description, CreatedAt, UpdatedAt)
    VALUES 
    ((CASE WHEN @i % 3 = 0 THEN @StudentId1 WHEN @i % 3 = 1 THEN @StudentId2 ELSE @StudentId3 END),
     @CourseId1,
     4499.00,
     'PHP',
     1, -- Completed
     'Credit Card',
     'TXN-' + CAST(NEWID() AS VARCHAR(50)),
     'Payment for Advanced React Patterns & Performance',
     @EnrollmentDate,
     @EnrollmentDate);
    
    -- Add review for completed courses
    IF @i <= 20
    BEGIN
        INSERT INTO Reviews (CourseId, StudentId, Rating, Comment, CreatedAt)
        VALUES 
        (@CourseId1,
         (CASE WHEN @i % 3 = 0 THEN @StudentId1 WHEN @i % 3 = 1 THEN @StudentId2 ELSE @StudentId3 END),
         4 + RAND(), -- Rating between 4 and 5
         'Excellent course! Learned so much about React patterns and performance optimization.',
         DATEADD(DAY, 31, @EnrollmentDate));
    END
    
    SET @i = @i + 1;
END

-- Course 2 enrollments (less popular)
SET @i = 1;
WHILE @i <= 30
BEGIN
    SET @EnrollmentDate = DATEADD(DAY, -RAND() * 120, GETDATE());
    
    INSERT INTO Enrollments (StudentId, CourseId, EnrolledAt, ProgressPercentage, CompletedAt, CertificateUrl)
    VALUES 
    ((CASE WHEN @i % 3 = 0 THEN @StudentId1 WHEN @i % 3 = 1 THEN @StudentId2 ELSE @StudentId3 END),
     @CourseId2, 
     @EnrollmentDate,
     CASE WHEN @i <= 10 THEN 100 -- 10 completed
          WHEN @i <= 25 THEN 20 + RAND() * 70 -- 15 in progress
          ELSE 0 -- 5 not started
     END,
     CASE WHEN @i <= 10 THEN DATEADD(DAY, 45, @EnrollmentDate) ELSE NULL END,
     CASE WHEN @i <= 10 THEN 'https://example.com/certificate/' + CAST(NEWID() AS VARCHAR(50)) ELSE NULL END);
    
    SET @EnrollmentId = SCOPE_IDENTITY();
    
    INSERT INTO Payments (UserId, CourseId, Amount, Currency, Status, PaymentMethod, 
        TransactionId, Description, CreatedAt, UpdatedAt)
    VALUES 
    ((CASE WHEN @i % 3 = 0 THEN @StudentId1 WHEN @i % 3 = 1 THEN @StudentId2 ELSE @StudentId3 END),
     @CourseId2,
     2999.00,
     'PHP',
     1, -- Completed
     'Credit Card',
     'TXN-' + CAST(NEWID() AS VARCHAR(50)),
     'Payment for JavaScript Fundamentals for Beginners',
     @EnrollmentDate,
     @EnrollmentDate);
    
    -- Add review for completed courses
    IF @i <= 10
    BEGIN
        INSERT INTO Reviews (CourseId, StudentId, Rating, Comment, CreatedAt)
        VALUES 
        (@CourseId2,
         (CASE WHEN @i % 3 = 0 THEN @StudentId1 WHEN @i % 3 = 1 THEN @StudentId2 ELSE @StudentId3 END),
         4.3 + RAND() * 0.7, -- Rating between 4.3 and 5
         'Great course for beginners! Very clear explanations.',
         DATEADD(DAY, 46, @EnrollmentDate));
    END
    
    SET @i = @i + 1;
END

-- Add some subscription-based enrollments for variety
DECLARE @SubPlanId INT;

-- Get or create a subscription plan
IF NOT EXISTS (SELECT 1 FROM SubscriptionPlans WHERE Name = 'Premium Monthly')
BEGIN
    INSERT INTO SubscriptionPlans (Name, Description, MonthlyPrice, Features, MaxCourseAccess, 
        HasUnlimitedAccess, IsActive, CreatedAt)
    VALUES 
    ('Premium Monthly', 
     'Unlimited access to all courses',
     1999.00,
     '["Unlimited course access", "Certificates of completion", "Priority support", "Downloadable resources"]',
     0,
     1,
     1,
     DATEADD(MONTH, -12, GETDATE()));
END

SELECT @SubPlanId = Id FROM SubscriptionPlans WHERE Name = 'Premium Monthly';

-- Add some active subscriptions
INSERT INTO Subscriptions (UserId, SubscriptionPlanId, PlanName, StartDate, EndDate, 
    Status, Price, Currency, PaymentMethod, CreatedAt)
VALUES 
(@StudentId1, @SubPlanId, 'Premium Monthly', 
 DATEADD(MONTH, -3, GETDATE()), DATEADD(MONTH, 9, GETDATE()), 
 0, 1999.00, 'PHP', 'Credit Card', DATEADD(MONTH, -3, GETDATE())),
 
(@StudentId2, @SubPlanId, 'Premium Monthly', 
 DATEADD(MONTH, -2, GETDATE()), DATEADD(MONTH, 10, GETDATE()), 
 0, 1999.00, 'PHP', 'Credit Card', DATEADD(MONTH, -2, GETDATE()));

-- Add subscription-based enrollments
INSERT INTO Enrollments (StudentId, CourseId, EnrolledAt, ProgressPercentage, IsSubscriptionEnrollment)
VALUES 
(@StudentId1, @CourseId1, DATEADD(MONTH, -2, GETDATE()), 65, 1),
(@StudentId2, @CourseId2, DATEADD(MONTH, -1, GETDATE()), 40, 1);

PRINT 'Successfully seeded data for Dr. Sarah Johnson:';
PRINT '- User ID: ' + CAST(@SarahId AS VARCHAR(50));
PRINT '- Course 1 (Advanced React): ' + CAST(@CourseId1 AS VARCHAR(10)) + ' with 50 enrollments';
PRINT '- Course 2 (JavaScript Fundamentals): ' + CAST(@CourseId2 AS VARCHAR(10)) + ' with 30 enrollments';
PRINT '- Total Revenue: ₱' + CAST((50 * 4499.00 + 30 * 2999.00) AS VARCHAR(20));
PRINT '- Reviews added for completed courses';
PRINT '- Subscription enrollments added';