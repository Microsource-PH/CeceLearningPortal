-- Seed data for Creator Sarah Johnson with realistic analytics and earnings data
-- PostgreSQL version

-- First, ensure Sarah Johnson exists as an instructor
DO $$
DECLARE
    sarah_id UUID;
    student_id1 UUID;
    student_id2 UUID;
    student_id3 UUID;
    course_id1 INT;
    course_id2 INT;
    module_id INT;
    enrollment_date TIMESTAMP;
    enrollment_id INT;
    i INT;
    sub_plan_id INT;
BEGIN
    -- Get or create Sarah Johnson
    SELECT "Id" INTO sarah_id FROM "AspNetUsers" WHERE "Email" = 'sarah.johnson@example.com';
    
    IF sarah_id IS NULL THEN
        sarah_id := gen_random_uuid();
        INSERT INTO "AspNetUsers" (
            "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", 
            "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", 
            "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnd", 
            "LockoutEnabled", "AccessFailedCount", "FullName", "Role", "CreatedAt"
        ) VALUES (
            sarah_id, 'sarah.johnson@example.com', 'SARAH.JOHNSON@EXAMPLE.COM', 
            'sarah.johnson@example.com', 'SARAH.JOHNSON@EXAMPLE.COM', true,
            'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==', -- Password: Creator123!
            gen_random_uuid()::text, gen_random_uuid()::text, 
            '+1234567890', false, false, NULL, true, 0,
            'Dr. Sarah Johnson', 2, NOW() - INTERVAL '12 months'
        );
    ELSE
        UPDATE "AspNetUsers" SET "Role" = 2 WHERE "Id" = sarah_id;
    END IF;

    -- Create test students
    student_id1 := gen_random_uuid();
    student_id2 := gen_random_uuid();
    student_id3 := gen_random_uuid();

    -- Insert students if they don't exist
    INSERT INTO "AspNetUsers" (
        "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", 
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", 
        "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnd", 
        "LockoutEnabled", "AccessFailedCount", "FullName", "Role", "CreatedAt"
    ) VALUES 
    (student_id1, 'john.doe@example.com', 'JOHN.DOE@EXAMPLE.COM', 
     'john.doe@example.com', 'JOHN.DOE@EXAMPLE.COM', true,
     'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==',
     gen_random_uuid()::text, gen_random_uuid()::text, 
     NULL, false, false, NULL, true, 0,
     'John Doe', 1, NOW() - INTERVAL '10 months'),
    
    (student_id2, 'jane.smith@example.com', 'JANE.SMITH@EXAMPLE.COM', 
     'jane.smith@example.com', 'JANE.SMITH@EXAMPLE.COM', true,
     'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==',
     gen_random_uuid()::text, gen_random_uuid()::text, 
     NULL, false, false, NULL, true, 0,
     'Jane Smith', 1, NOW() - INTERVAL '8 months'),
    
    (student_id3, 'mike.wilson@example.com', 'MIKE.WILSON@EXAMPLE.COM', 
     'mike.wilson@example.com', 'MIKE.WILSON@EXAMPLE.COM', true,
     'AQAAAAIAAYagAAAAEMftkx0v9LW6Y7KaU0M2CXjKfOpGhGY5Xh8wXFHNV3h/JMxKRKcXPRiPGaQKKbH8dg==',
     gen_random_uuid()::text, gen_random_uuid()::text, 
     NULL, false, false, NULL, true, 0,
     'Mike Wilson', 1, NOW() - INTERVAL '6 months')
    ON CONFLICT ("Email") DO NOTHING;

    -- Delete existing data for Sarah
    DELETE FROM "LessonProgress" WHERE "EnrollmentId" IN 
        (SELECT "Id" FROM "Enrollments" WHERE "CourseId" IN 
            (SELECT "Id" FROM "Courses" WHERE "InstructorId" = sarah_id));
    DELETE FROM "Reviews" WHERE "CourseId" IN (SELECT "Id" FROM "Courses" WHERE "InstructorId" = sarah_id);
    DELETE FROM "Payments" WHERE "CourseId" IN (SELECT "Id" FROM "Courses" WHERE "InstructorId" = sarah_id);
    DELETE FROM "Enrollments" WHERE "CourseId" IN (SELECT "Id" FROM "Courses" WHERE "InstructorId" = sarah_id);
    DELETE FROM "Lessons" WHERE "ModuleId" IN (SELECT "Id" FROM "CourseModules" WHERE "CourseId" IN 
        (SELECT "Id" FROM "Courses" WHERE "InstructorId" = sarah_id));
    DELETE FROM "CourseModules" WHERE "CourseId" IN (SELECT "Id" FROM "Courses" WHERE "InstructorId" = sarah_id);
    DELETE FROM "Courses" WHERE "InstructorId" = sarah_id;

    -- Create Course 1: Advanced React Patterns & Performance
    INSERT INTO "Courses" (
        "Title", "Description", "Category", "Level", "Price", "Status", "InstructorId", 
        "Duration", "Language", "PreviewVideoUrl", "ThumbnailUrl", "LearningObjectives", 
        "Requirements", "CreatedAt", "UpdatedAt"
    ) VALUES (
        'Advanced React Patterns & Performance', 
        'Master advanced React concepts including hooks, context, performance optimization, and architectural patterns. Learn from real-world examples and build scalable applications.',
        'Web Development', 2, 4499.00, 1, sarah_id,
        '8 hours', 'English', 
        'https://example.com/preview/react-advanced',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format',
        '["Master React Hooks and Custom Hooks", "Implement Context API effectively", "Optimize React performance", "Build scalable component architecture", "Handle complex state management", "Implement advanced patterns"]',
        '["Solid understanding of React basics", "JavaScript ES6+ knowledge", "Basic understanding of state management"]',
        NOW() - INTERVAL '6 months',
        NOW()
    ) RETURNING "Id" INTO course_id1;

    -- Create Course 2: JavaScript Fundamentals for Beginners
    INSERT INTO "Courses" (
        "Title", "Description", "Category", "Level", "Price", "Status", "InstructorId", 
        "Duration", "Language", "PreviewVideoUrl", "ThumbnailUrl", "LearningObjectives", 
        "Requirements", "CreatedAt", "UpdatedAt"
    ) VALUES (
        'JavaScript Fundamentals for Beginners', 
        'Learn JavaScript from scratch with hands-on projects and real-world examples. Perfect for beginners who want to start their web development journey.',
        'Programming', 0, 2999.00, 1, sarah_id,
        '12 hours', 'English', 
        'https://example.com/preview/js-fundamentals',
        'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop&auto=format',
        '["Understand JavaScript basics", "Work with variables and data types", "Master functions and objects", "Handle arrays and loops", "Understand DOM manipulation", "Build interactive web pages"]',
        '["Basic computer skills", "No programming experience required"]',
        NOW() - INTERVAL '4 months',
        NOW()
    ) RETURNING "Id" INTO course_id2;

    -- Create modules for Course 1
    INSERT INTO "CourseModules" ("CourseId", "Title", "Order", "Description")
    VALUES 
    (course_id1, 'Introduction to Advanced React', 1, 'Overview of advanced React concepts'),
    (course_id1, 'React Hooks Deep Dive', 2, 'Master all React hooks including custom hooks'),
    (course_id1, 'Performance Optimization', 3, 'Learn to optimize React applications'),
    (course_id1, 'Advanced Patterns', 4, 'Implement advanced React patterns');

    -- Create modules for Course 2
    INSERT INTO "CourseModules" ("CourseId", "Title", "Order", "Description")
    VALUES 
    (course_id2, 'JavaScript Basics', 1, 'Introduction to JavaScript programming'),
    (course_id2, 'Functions and Objects', 2, 'Understanding functions and object-oriented programming'),
    (course_id2, 'Working with the DOM', 3, 'Manipulating web pages with JavaScript');

    -- Create enrollments and payments for Course 1 (50 enrollments)
    FOR i IN 1..50 LOOP
        enrollment_date := NOW() - (random() * INTERVAL '180 days');
        
        INSERT INTO "Enrollments" (
            "StudentId", "CourseId", "EnrolledAt", "ProgressPercentage", 
            "CompletedAt", "CertificateUrl", "IsSubscriptionEnrollment"
        ) VALUES (
            CASE 
                WHEN i % 3 = 0 THEN student_id1 
                WHEN i % 3 = 1 THEN student_id2 
                ELSE student_id3 
            END,
            course_id1, 
            enrollment_date,
            CASE 
                WHEN i <= 20 THEN 100 -- 20 completed
                WHEN i <= 40 THEN 30 + random() * 60 -- 20 in progress
                ELSE 0 -- 10 not started
            END,
            CASE WHEN i <= 20 THEN enrollment_date + INTERVAL '30 days' ELSE NULL END,
            CASE WHEN i <= 20 THEN 'https://example.com/certificate/' || gen_random_uuid() ELSE NULL END,
            false
        ) RETURNING "Id" INTO enrollment_id;
        
        -- Insert payment
        INSERT INTO "Payments" (
            "UserId", "CourseId", "Amount", "Currency", "Status", "PaymentMethod", 
            "TransactionId", "Description", "CreatedAt", "UpdatedAt"
        ) VALUES (
            CASE 
                WHEN i % 3 = 0 THEN student_id1 
                WHEN i % 3 = 1 THEN student_id2 
                ELSE student_id3 
            END,
            course_id1,
            4499.00,
            'PHP',
            1, -- Completed
            'Credit Card',
            'TXN-' || gen_random_uuid(),
            'Payment for Advanced React Patterns & Performance',
            enrollment_date,
            enrollment_date
        );
        
        -- Add review for completed courses
        IF i <= 20 THEN
            INSERT INTO "Reviews" ("CourseId", "StudentId", "Rating", "Comment", "CreatedAt")
            VALUES (
                course_id1,
                CASE 
                    WHEN i % 3 = 0 THEN student_id1 
                    WHEN i % 3 = 1 THEN student_id2 
                    ELSE student_id3 
                END,
                4 + random(), -- Rating between 4 and 5
                'Excellent course! Learned so much about React patterns and performance optimization.',
                enrollment_date + INTERVAL '31 days'
            );
        END IF;
    END LOOP;

    -- Create enrollments and payments for Course 2 (30 enrollments)
    FOR i IN 1..30 LOOP
        enrollment_date := NOW() - (random() * INTERVAL '120 days');
        
        INSERT INTO "Enrollments" (
            "StudentId", "CourseId", "EnrolledAt", "ProgressPercentage", 
            "CompletedAt", "CertificateUrl", "IsSubscriptionEnrollment"
        ) VALUES (
            CASE 
                WHEN i % 3 = 0 THEN student_id1 
                WHEN i % 3 = 1 THEN student_id2 
                ELSE student_id3 
            END,
            course_id2, 
            enrollment_date,
            CASE 
                WHEN i <= 10 THEN 100 -- 10 completed
                WHEN i <= 25 THEN 20 + random() * 70 -- 15 in progress
                ELSE 0 -- 5 not started
            END,
            CASE WHEN i <= 10 THEN enrollment_date + INTERVAL '45 days' ELSE NULL END,
            CASE WHEN i <= 10 THEN 'https://example.com/certificate/' || gen_random_uuid() ELSE NULL END,
            false
        ) RETURNING "Id" INTO enrollment_id;
        
        -- Insert payment
        INSERT INTO "Payments" (
            "UserId", "CourseId", "Amount", "Currency", "Status", "PaymentMethod", 
            "TransactionId", "Description", "CreatedAt", "UpdatedAt"
        ) VALUES (
            CASE 
                WHEN i % 3 = 0 THEN student_id1 
                WHEN i % 3 = 1 THEN student_id2 
                ELSE student_id3 
            END,
            course_id2,
            2999.00,
            'PHP',
            1, -- Completed
            'Credit Card',
            'TXN-' || gen_random_uuid(),
            'Payment for JavaScript Fundamentals for Beginners',
            enrollment_date,
            enrollment_date
        );
        
        -- Add review for completed courses
        IF i <= 10 THEN
            INSERT INTO "Reviews" ("CourseId", "StudentId", "Rating", "Comment", "CreatedAt")
            VALUES (
                course_id2,
                CASE 
                    WHEN i % 3 = 0 THEN student_id1 
                    WHEN i % 3 = 1 THEN student_id2 
                    ELSE student_id3 
                END,
                4.3 + random() * 0.7, -- Rating between 4.3 and 5
                'Great course for beginners! Very clear explanations.',
                enrollment_date + INTERVAL '46 days'
            );
        END IF;
    END LOOP;

    -- Add subscription plan and enrollments
    SELECT "Id" INTO sub_plan_id FROM "SubscriptionPlans" WHERE "Name" = 'Premium Monthly';
    
    IF sub_plan_id IS NULL THEN
        INSERT INTO "SubscriptionPlans" (
            "Name", "Description", "MonthlyPrice", "Features", 
            "MaxCourseAccess", "HasUnlimitedAccess", "IsActive", "CreatedAt"
        ) VALUES (
            'Premium Monthly', 
            'Unlimited access to all courses',
            1999.00,
            '["Unlimited course access", "Certificates of completion", "Priority support", "Downloadable resources"]',
            0,
            true,
            true,
            NOW() - INTERVAL '12 months'
        ) RETURNING "Id" INTO sub_plan_id;
    END IF;

    -- Add active subscriptions
    INSERT INTO "Subscriptions" (
        "UserId", "SubscriptionPlanId", "PlanName", "StartDate", "EndDate", 
        "Status", "Price", "Currency", "PaymentMethod", "CreatedAt"
    ) VALUES 
    (student_id1, sub_plan_id, 'Premium Monthly', 
     NOW() - INTERVAL '3 months', NOW() + INTERVAL '9 months', 
     0, 1999.00, 'PHP', 'Credit Card', NOW() - INTERVAL '3 months'),
    
    (student_id2, sub_plan_id, 'Premium Monthly', 
     NOW() - INTERVAL '2 months', NOW() + INTERVAL '10 months', 
     0, 1999.00, 'PHP', 'Credit Card', NOW() - INTERVAL '2 months')
    ON CONFLICT DO NOTHING;

    -- Add subscription-based enrollments
    INSERT INTO "Enrollments" (
        "StudentId", "CourseId", "EnrolledAt", "ProgressPercentage", "IsSubscriptionEnrollment"
    ) VALUES 
    (student_id1, course_id1, NOW() - INTERVAL '2 months', 65, true),
    (student_id2, course_id2, NOW() - INTERVAL '1 month', 40, true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully seeded data for Dr. Sarah Johnson:';
    RAISE NOTICE '- User ID: %', sarah_id;
    RAISE NOTICE '- Course 1 (Advanced React): % with 50 enrollments', course_id1;
    RAISE NOTICE '- Course 2 (JavaScript Fundamentals): % with 30 enrollments', course_id2;
    RAISE NOTICE '- Total Revenue: ₱%', (50 * 4499.00 + 30 * 2999.00);
    RAISE NOTICE '- Reviews added for completed courses';
    RAISE NOTICE '- Subscription enrollments added';
END $$;