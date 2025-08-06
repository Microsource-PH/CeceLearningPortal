-- Create subscription plans table with configurable course access
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly',
    features JSONB,
    course_access_type VARCHAR(50) NOT NULL, -- 'all', 'category', 'selected'
    accessible_categories JSONB, -- For category-based access
    accessible_course_ids JSONB, -- For selected courses access
    max_courses_per_month INTEGER, -- Limit courses per month
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert subscription plans
INSERT INTO subscription_plans (id, name, description, price, billing_period, features, course_access_type, accessible_categories, max_courses_per_month) VALUES
    ('basic', 'Basic Plan', 'Access to beginner courses', 1999.00, 'monthly', 
     '["Access to Beginner courses", "Mobile access", "Community support"]', 
     'category', '["Web Development", "UI/UX Design"]', 3),
    
    ('premium', 'Premium Plan', 'Full access to all courses', 4999.00, 'monthly',
     '["Unlimited course access", "Certificates", "Priority support", "Downloadable resources"]',
     'all', NULL, NULL),
     
    ('professional', 'Professional Plan', 'For serious learners', 3499.00, 'monthly',
     '["Access to Intermediate and Advanced courses", "1-on-1 mentoring sessions", "Career guidance"]',
     'category', '["Web Development", "Backend Development", "Machine Learning", "Data Science"]', 10)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    course_access_type = EXCLUDED.course_access_type,
    accessible_categories = EXCLUDED.accessible_categories,
    max_courses_per_month = EXCLUDED.max_courses_per_month;

-- Add new students
INSERT INTO users (id, email, encrypted_password) VALUES
    -- Direct purchase student
    ('d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'maria.garcia@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy'),
    -- Premium subscriber
    ('e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', 'robert.chen@example.com', '$2a$10$PJqDr1F0Y9Y1w6X9Xzp/2u5BH9PpF5dQqFjzK.6CKTtKlhSQqQ8Hy')
ON CONFLICT (id) DO NOTHING;

-- Add profiles for new students
INSERT INTO profiles (id, full_name, avatar_url, bio, location, role, social_links) VALUES
    ('d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'Maria Garcia', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop', 'Aspiring web developer learning computer vision for innovative projects.', 'Barcelona, Spain', 'Learner', '{"linkedin": "https://linkedin.com/in/mariagarcia"}'),
    ('e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', 'Robert Chen', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop', 'Tech entrepreneur exploring AI and machine learning. Premium subscriber.', 'Singapore', 'Learner', '{"linkedin": "https://linkedin.com/in/robertchen", "twitter": "https://twitter.com/rchen_tech"}')
ON CONFLICT (id) DO NOTHING;

-- Add user stats for new students
INSERT INTO user_stats (user_id, total_courses, completed_courses, in_progress_courses, total_hours, certificates, average_score, current_streak, longest_streak) VALUES
    ('d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 1, 0, 1, 12.5, 0, 0, 5, 5),
    ('e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', 3, 1, 2, 45.0, 1, 88.5, 12, 15)
ON CONFLICT (user_id) DO NOTHING;

-- Get Dr. Johnson's React course ID
DO $$
DECLARE
    react_course_id INTEGER;
    -- Change this to the actual course you want
    cv_course_id INTEGER;
BEGIN
    -- Get Complete React Developer Course ID
    SELECT id INTO react_course_id FROM courses WHERE title = 'Complete React Developer Course' AND instructor_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d' LIMIT 1;
    
    -- Since the original request mentioned Computer Vision Fundamentals but it wasn't in Dr. Johnson's courses,
    -- let's use React course instead
    cv_course_id := react_course_id;

    IF cv_course_id IS NOT NULL THEN
        -- Maria Garcia - Direct purchase of Dr. Johnson's course
        INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at) VALUES
            ('d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', cv_course_id, 35, 'active', NOW() - INTERVAL '5 days')
        ON CONFLICT (user_id, course_id) DO NOTHING;

        -- Add transaction for Maria's direct purchase
        INSERT INTO transactions (user_id, course_id, amount, type, status, payment_method) VALUES
            ('d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', cv_course_id, 2999.00, 'course_purchase', 'completed', 'credit_card')
        ON CONFLICT DO NOTHING;

        -- Robert Chen - Premium subscriber enrolled in Dr. Johnson's course
        INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at) VALUES
            ('e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', cv_course_id, 65, 'active', NOW() - INTERVAL '15 days')
        ON CONFLICT (user_id, course_id) DO NOTHING;

        -- Update course statistics
        UPDATE courses c SET
            total_students = (SELECT COUNT(DISTINCT user_id) FROM enrollments WHERE course_id = c.id),
            total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE course_id = c.id AND status = 'completed')
        WHERE c.id = cv_course_id;
    END IF;
END $$;

-- Add Robert's premium subscription
INSERT INTO subscriptions (user_id, plan_id, status, amount, start_date, expires_at) VALUES
    ('e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', 'premium', 'active', 4999.00, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Function to calculate subscription revenue share for creators
CREATE OR REPLACE FUNCTION calculate_subscription_revenue_for_creator(p_creator_id UUID, p_period_start DATE DEFAULT NULL, p_period_end DATE DEFAULT NULL)
RETURNS TABLE (
    plan_id VARCHAR(50),
    plan_name VARCHAR(100),
    subscriber_count INTEGER,
    plan_revenue DECIMAL(10,2),
    accessible_courses INTEGER,
    creator_courses INTEGER,
    creator_share DECIMAL(10,2),
    revenue_per_course DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH subscription_data AS (
        SELECT 
            sp.id as plan_id,
            sp.name as plan_name,
            sp.price as plan_price,
            sp.course_access_type,
            sp.accessible_categories,
            COUNT(DISTINCT s.user_id) as subscriber_count
        FROM subscription_plans sp
        JOIN subscriptions s ON s.plan_id = sp.id
        WHERE s.status = 'active'
            AND (p_period_start IS NULL OR s.start_date >= p_period_start)
            AND (p_period_end IS NULL OR s.start_date <= p_period_end)
        GROUP BY sp.id, sp.name, sp.price, sp.course_access_type, sp.accessible_categories
    ),
    course_counts AS (
        SELECT 
            sd.plan_id,
            sd.plan_name,
            sd.subscriber_count,
            sd.plan_price * sd.subscriber_count as total_revenue,
            -- Count total accessible courses based on plan type
            CASE 
                WHEN sd.course_access_type = 'all' THEN 
                    (SELECT COUNT(*) FROM courses WHERE status = 'active')
                WHEN sd.course_access_type = 'category' THEN
                    (SELECT COUNT(*) FROM courses c 
                     WHERE c.status = 'active' 
                     AND c.category = ANY(SELECT jsonb_array_elements_text(sd.accessible_categories)))
                ELSE 0
            END as total_accessible_courses,
            -- Count creator's courses accessible by this plan
            CASE 
                WHEN sd.course_access_type = 'all' THEN 
                    (SELECT COUNT(*) FROM courses WHERE instructor_id = p_creator_id AND status = 'active')
                WHEN sd.course_access_type = 'category' THEN
                    (SELECT COUNT(*) FROM courses c 
                     WHERE c.instructor_id = p_creator_id 
                     AND c.status = 'active'
                     AND c.category = ANY(SELECT jsonb_array_elements_text(sd.accessible_categories)))
                ELSE 0
            END as creator_accessible_courses
        FROM subscription_data sd
    )
    SELECT 
        cc.plan_id,
        cc.plan_name,
        cc.subscriber_count,
        cc.total_revenue as plan_revenue,
        cc.total_accessible_courses as accessible_courses,
        cc.creator_accessible_courses as creator_courses,
        -- Calculate creator's share: (creator_courses / total_courses) * total_revenue * 0.7 (platform keeps 30% of subscription revenue)
        CASE 
            WHEN cc.total_accessible_courses > 0 THEN
                ROUND((cc.creator_accessible_courses::DECIMAL / cc.total_accessible_courses) * cc.total_revenue * 0.7, 2)
            ELSE 0
        END as creator_share,
        -- Revenue per course
        CASE 
            WHEN cc.total_accessible_courses > 0 THEN
                ROUND(cc.total_revenue / cc.total_accessible_courses, 2)
            ELSE 0
        END as revenue_per_course
    FROM course_counts cc
    WHERE cc.creator_accessible_courses > 0
    ORDER BY cc.plan_id;
END;
$$ LANGUAGE plpgsql;

-- Updated function to calculate total creator earnings including subscriptions
CREATE OR REPLACE FUNCTION calculate_creator_total_earnings(p_creator_id UUID)
RETURNS TABLE (
    direct_purchase_revenue DECIMAL(10,2),
    direct_purchase_earnings DECIMAL(10,2),
    subscription_revenue DECIMAL(10,2),
    total_revenue DECIMAL(10,2),
    total_earnings DECIMAL(10,2),
    platform_fees DECIMAL(10,2)
) AS $$
DECLARE
    v_direct_revenue DECIMAL(10,2);
    v_subscription_revenue DECIMAL(10,2);
BEGIN
    -- Calculate direct purchase revenue
    SELECT COALESCE(SUM(c.total_revenue), 0) INTO v_direct_revenue
    FROM courses c
    WHERE c.instructor_id = p_creator_id;
    
    -- Calculate subscription revenue share
    SELECT COALESCE(SUM(sr.creator_share), 0) INTO v_subscription_revenue
    FROM calculate_subscription_revenue_for_creator(p_creator_id) sr;
    
    RETURN QUERY
    SELECT 
        v_direct_revenue as direct_purchase_revenue,
        v_direct_revenue * 0.8 as direct_purchase_earnings, -- 80% to creator
        v_subscription_revenue as subscription_revenue,
        v_direct_revenue + v_subscription_revenue as total_revenue,
        (v_direct_revenue * 0.8) + v_subscription_revenue as total_earnings,
        (v_direct_revenue * 0.2) + (v_subscription_revenue * 0.3 / 0.7) as platform_fees;
END;
$$ LANGUAGE plpgsql;