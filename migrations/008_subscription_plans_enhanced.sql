-- Enhanced Subscription Plans for Learners and Creators
-- This migration adds comprehensive subscription management

-- Drop existing subscription_plans table if it exists
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Create subscription_plans table with more flexibility
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('learner', 'creator')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'lifetime')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_plan_features table for detailed feature management
CREATE TABLE subscription_plan_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value TEXT,
    feature_type VARCHAR(50) DEFAULT 'boolean',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update subscriptions table to reference new plans
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_uuid UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- Add subscription_type to profiles to distinguish learners and creators
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50) CHECK (subscription_type IN ('learner', 'creator', 'both', NULL));

-- Create course_approvals table for tracking approval workflow
CREATE TABLE IF NOT EXISTS course_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add approval fields to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
ADD COLUMN IF NOT EXISTS submitted_for_review TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, type, billing_cycle, price, features, limits) VALUES
-- Learner Plans
('Free Learner', 'Basic access to free courses', 'learner', 'monthly', 0, 
 '["Access to free courses", "Community forum access", "Basic progress tracking"]',
 '{"courses_per_month": 2, "certificates": false}'),
 
('Basic Learner', 'Access to all courses with basic features', 'learner', 'monthly', 29.99,
 '["Access to all courses", "Course certificates", "Progress tracking", "Community access"]',
 '{"courses_per_month": 10, "certificates": true}'),
 
('Pro Learner', 'Full access with premium features', 'learner', 'monthly', 49.99,
 '["Unlimited course access", "Priority support", "Downloadable resources", "1-on-1 mentoring sessions", "Early access to new courses"]',
 '{"courses_per_month": -1, "certificates": true, "mentoring_hours": 2}'),
 
('Annual Pro Learner', 'Pro plan with annual discount', 'learner', 'yearly', 499.99,
 '["All Pro features", "20% discount", "Exclusive workshops"]',
 '{"courses_per_month": -1, "certificates": true, "mentoring_hours": 24}'),

-- Creator Plans
('Starter Creator', 'For new instructors', 'creator', 'monthly', 19.99,
 '["Create up to 3 courses", "Basic analytics", "Student messaging", "Course certificates"]',
 '{"max_courses": 3, "max_students": 100, "revenue_share": 0.7}'),
 
('Professional Creator', 'For established instructors', 'creator', 'monthly', 49.99,
 '["Create up to 10 courses", "Advanced analytics", "Custom branding", "Priority support", "Marketing tools"]',
 '{"max_courses": 10, "max_students": 1000, "revenue_share": 0.8}'),
 
('Enterprise Creator', 'For organizations and top creators', 'creator', 'monthly', 99.99,
 '["Unlimited courses", "White-label options", "API access", "Dedicated support", "Custom integrations"]',
 '{"max_courses": -1, "max_students": -1, "revenue_share": 0.9}'),
 
('Annual Enterprise', 'Enterprise with annual discount', 'creator', 'yearly', 999.99,
 '["All Enterprise features", "20% discount", "Custom onboarding"]',
 '{"max_courses": -1, "max_students": -1, "revenue_share": 0.9}');

-- Create a function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits(user_id UUID, action_type VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan RECORD;
    current_usage INTEGER;
BEGIN
    -- Get user's active subscription plan
    SELECT sp.*, s.* INTO user_plan
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_uuid = sp.id
    WHERE s.user_id = user_id 
    AND s.status = 'active'
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check specific limits based on action type
    CASE action_type
        WHEN 'create_course' THEN
            IF user_plan.type != 'creator' THEN
                RETURN FALSE;
            END IF;
            
            SELECT COUNT(*) INTO current_usage
            FROM courses
            WHERE instructor_id = user_id
            AND deleted_at IS NULL;
            
            -- Check if within limits (-1 means unlimited)
            IF (user_plan.limits->>'max_courses')::INTEGER = -1 THEN
                RETURN TRUE;
            ELSE
                RETURN current_usage < (user_plan.limits->>'max_courses')::INTEGER;
            END IF;
            
        WHEN 'enroll_course' THEN
            IF user_plan.type != 'learner' THEN
                RETURN FALSE;
            END IF;
            
            -- Check monthly enrollment limit
            SELECT COUNT(*) INTO current_usage
            FROM enrollments
            WHERE user_id = user_id
            AND enrolled_at >= DATE_TRUNC('month', CURRENT_DATE);
            
            IF (user_plan.limits->>'courses_per_month')::INTEGER = -1 THEN
                RETURN TRUE;
            ELSE
                RETURN current_usage < (user_plan.limits->>'courses_per_month')::INTEGER;
            END IF;
    END CASE;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create view for user subscription status
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
    u.id as user_id,
    u.email,
    p.full_name,
    p.role,
    p.subscription_type,
    s.id as subscription_id,
    sp.name as plan_name,
    sp.type as plan_type,
    sp.price,
    sp.billing_cycle,
    s.status as subscription_status,
    s.start_date,
    s.expires_at,
    s.auto_renew,
    s.next_billing_date,
    CASE 
        WHEN s.status = 'active' AND (s.expires_at IS NULL OR s.expires_at > NOW()) THEN true
        ELSE false
    END as is_active_subscriber
FROM users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON s.plan_uuid = sp.id;

-- Update existing users with subscription types based on their roles
UPDATE profiles 
SET subscription_type = CASE 
    WHEN role = 'Creator' THEN 'creator'
    WHEN role = 'Learner' THEN 'learner'
    WHEN role = 'Admin' THEN 'both'
    ELSE NULL
END;

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);
CREATE INDEX idx_course_approvals_status ON course_approvals(status);
CREATE INDEX idx_courses_approval_status ON courses(approval_status);
CREATE INDEX idx_subscription_plans_type ON subscription_plans(type, is_active);