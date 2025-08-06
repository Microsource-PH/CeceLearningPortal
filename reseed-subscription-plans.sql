-- Clear existing subscription plans
DELETE FROM "Subscriptions";
DELETE FROM "SubscriptionPlans";

-- Insert new subscription plans with proper types
INSERT INTO "SubscriptionPlans" ("Id", "Name", "Description", "Price", "BillingCycle", "Features", "MaxCourses", "IsActive", "CreatedAt", "UpdatedAt", "PlanType", "MaxCoursesCanCreate", "MaxStudentsPerCourse", "TransactionFeePercentage", "HasAnalytics", "HasPrioritySupport", "DisplayOrder", "IsRecommended")
VALUES 
-- Learner Plans (PlanType = 0)
('11111111-1111-1111-1111-111111111111', 'Free Learner', 'Perfect for trying out our platform', 0, 1, '["Access to 5 free courses", "Basic progress tracking", "Community support"]', 5, true, NOW(), NOW(), 0, NULL, NULL, NULL, false, false, 1, false),
('22222222-2222-2222-2222-222222222222', 'Basic Learner', 'Great for casual learners', 9.99, 1, '["Access to 20 courses per month", "Advanced progress tracking", "Email support", "Course certificates"]', 20, true, NOW(), NOW(), 0, NULL, NULL, NULL, false, false, 2, false),
('33333333-3333-3333-3333-333333333333', 'Premium Learner', 'Best for serious learners', 19.99, 1, '["Unlimited course access", "Priority support", "Downloadable resources", "1-on-1 mentoring sessions"]', -1, true, NOW(), NOW(), 0, NULL, NULL, NULL, true, true, 3, true),
('44444444-4444-4444-4444-444444444444', 'Enterprise Learner', 'Perfect for organizations', 49.99, 1, '["Everything in Premium", "Team management", "Custom learning paths", "Analytics dashboard", "SSO integration"]', -1, true, NOW(), NOW(), 0, NULL, NULL, NULL, true, true, 4, false),

-- Creator Plans (PlanType = 1)
('55555555-5555-5555-5555-555555555555', 'Starter Creator', 'Start your teaching journey', 29.99, 1, '["Create up to 5 courses", "Basic analytics", "Standard support", "90% revenue share"]', NULL, true, NOW(), NOW(), 1, 5, 100, 10.0, false, false, 5, false),
('66666666-6666-6666-6666-666666666666', 'Professional Creator', 'For professional instructors', 99.99, 1, '["Create unlimited courses", "Advanced analytics", "Priority support", "95% revenue share", "Marketing tools"]', NULL, true, NOW(), NOW(), 1, NULL, 1000, 5.0, true, true, 6, true),
('77777777-7777-7777-7777-777777777777', 'Institution Creator', 'For educational institutions', 299.99, 1, '["Everything in Professional", "Multiple instructor accounts", "White-label options", "API access", "97% revenue share"]', NULL, true, NOW(), NOW(), 1, NULL, NULL, 3.0, true, true, 7, false);