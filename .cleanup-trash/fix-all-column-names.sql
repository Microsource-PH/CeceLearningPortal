-- First, let's check what columns we have
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name LIKE '%ccessDuration%' OR column_name LIKE '%ccess_duration%';

-- Create temporary columns with snake_case names if they don't exist
DO $$
BEGIN
    -- For each PascalCase column, create a snake_case version if it doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AccessDuration') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'access_duration') THEN
        ALTER TABLE courses ADD COLUMN access_duration integer;
        UPDATE courses SET access_duration = "AccessDuration";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AccessType') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'access_type') THEN
        ALTER TABLE courses ADD COLUMN access_type integer;
        UPDATE courses SET access_type = "AccessType";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PricingModel') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'pricing_model') THEN
        ALTER TABLE courses ADD COLUMN pricing_model integer;
        UPDATE courses SET pricing_model = "PricingModel";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'Currency') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'currency') THEN
        ALTER TABLE courses ADD COLUMN currency text;
        UPDATE courses SET currency = "Currency";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'SubscriptionPeriod') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'subscription_period') THEN
        ALTER TABLE courses ADD COLUMN subscription_period integer;
        UPDATE courses SET subscription_period = "SubscriptionPeriod";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PaymentPlanDetailsJson') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'payment_plan_details_json') THEN
        ALTER TABLE courses ADD COLUMN payment_plan_details_json text;
        UPDATE courses SET payment_plan_details_json = "PaymentPlanDetailsJson";
    END IF;
    
    -- Continue for other columns...
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasCertificate') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_certificate') THEN
        ALTER TABLE courses ADD COLUMN has_certificate boolean;
        UPDATE courses SET has_certificate = "HasCertificate";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasCommunity') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_community') THEN
        ALTER TABLE courses ADD COLUMN has_community boolean;
        UPDATE courses SET has_community = "HasCommunity";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasLiveSessions') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_live_sessions') THEN
        ALTER TABLE courses ADD COLUMN has_live_sessions boolean;
        UPDATE courses SET has_live_sessions = "HasLiveSessions";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasDownloadableResources') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_downloadable_resources') THEN
        ALTER TABLE courses ADD COLUMN has_downloadable_resources boolean;
        UPDATE courses SET has_downloadable_resources = "HasDownloadableResources";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasAssignments') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_assignments') THEN
        ALTER TABLE courses ADD COLUMN has_assignments boolean;
        UPDATE courses SET has_assignments = "HasAssignments";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasQuizzes') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_quizzes') THEN
        ALTER TABLE courses ADD COLUMN has_quizzes boolean;
        UPDATE courses SET has_quizzes = "HasQuizzes";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'DripContent') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'drip_content') THEN
        ALTER TABLE courses ADD COLUMN drip_content boolean;
        UPDATE courses SET drip_content = "DripContent";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'DripScheduleJson') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'drip_schedule_json') THEN
        ALTER TABLE courses ADD COLUMN drip_schedule_json text;
        UPDATE courses SET drip_schedule_json = "DripScheduleJson";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationWelcomeEmail') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'automation_welcome_email') THEN
        ALTER TABLE courses ADD COLUMN automation_welcome_email boolean;
        UPDATE courses SET automation_welcome_email = "AutomationWelcomeEmail";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationCompletionCertificate') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'automation_completion_certificate') THEN
        ALTER TABLE courses ADD COLUMN automation_completion_certificate boolean;
        UPDATE courses SET automation_completion_certificate = "AutomationCompletionCertificate";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationProgressReminders') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'automation_progress_reminders') THEN
        ALTER TABLE courses ADD COLUMN automation_progress_reminders boolean;
        UPDATE courses SET automation_progress_reminders = "AutomationProgressReminders";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationAbandonmentSequence') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'automation_abandonment_sequence') THEN
        ALTER TABLE courses ADD COLUMN automation_abandonment_sequence boolean;
        UPDATE courses SET automation_abandonment_sequence = "AutomationAbandonmentSequence";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PublishedAt') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'published_at') THEN
        ALTER TABLE courses ADD COLUMN published_at timestamp with time zone;
        UPDATE courses SET published_at = "PublishedAt";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'ShortDescription') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'short_description') THEN
        ALTER TABLE courses ADD COLUMN short_description text;
        UPDATE courses SET short_description = "ShortDescription";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PromoVideoUrl') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'promo_video_url') THEN
        ALTER TABLE courses ADD COLUMN promo_video_url text;
        UPDATE courses SET promo_video_url = "PromoVideoUrl";
    END IF;
END $$;

-- Check the results
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'courses' 
AND (column_name LIKE '%access%' OR column_name LIKE '%Access%')
ORDER BY column_name;