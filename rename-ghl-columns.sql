-- Rename all PascalCase GHL columns to snake_case
DO $$ 
BEGIN
    -- Only rename if the column exists with PascalCase
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AccessDuration') THEN
        ALTER TABLE courses RENAME COLUMN "AccessDuration" TO access_duration;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'CourseType' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_type')) THEN
        ALTER TABLE courses RENAME COLUMN "CourseType" TO course_type_ghl;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PricingModel') THEN
        ALTER TABLE courses RENAME COLUMN "PricingModel" TO pricing_model;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'Currency') THEN
        ALTER TABLE courses RENAME COLUMN "Currency" TO currency;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'SubscriptionPeriod') THEN
        ALTER TABLE courses RENAME COLUMN "SubscriptionPeriod" TO subscription_period;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PaymentPlanDetailsJson') THEN
        ALTER TABLE courses RENAME COLUMN "PaymentPlanDetailsJson" TO payment_plan_details_json;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AccessType') THEN
        ALTER TABLE courses RENAME COLUMN "AccessType" TO access_type;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'EnrollmentLimit' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'enrollment_limit')) THEN
        ALTER TABLE courses RENAME COLUMN "EnrollmentLimit" TO enrollment_limit_ghl;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'Language' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'language')) THEN
        ALTER TABLE courses RENAME COLUMN "Language" TO language_ghl;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasCertificate') THEN
        ALTER TABLE courses RENAME COLUMN "HasCertificate" TO has_certificate;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasCommunity') THEN
        ALTER TABLE courses RENAME COLUMN "HasCommunity" TO has_community;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasLiveSessions') THEN
        ALTER TABLE courses RENAME COLUMN "HasLiveSessions" TO has_live_sessions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasDownloadableResources') THEN
        ALTER TABLE courses RENAME COLUMN "HasDownloadableResources" TO has_downloadable_resources;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasAssignments') THEN
        ALTER TABLE courses RENAME COLUMN "HasAssignments" TO has_assignments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'HasQuizzes') THEN
        ALTER TABLE courses RENAME COLUMN "HasQuizzes" TO has_quizzes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'DripContent') THEN
        ALTER TABLE courses RENAME COLUMN "DripContent" TO drip_content;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'DripScheduleJson') THEN
        ALTER TABLE courses RENAME COLUMN "DripScheduleJson" TO drip_schedule_json;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationWelcomeEmail') THEN
        ALTER TABLE courses RENAME COLUMN "AutomationWelcomeEmail" TO automation_welcome_email;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationCompletionCertificate') THEN
        ALTER TABLE courses RENAME COLUMN "AutomationCompletionCertificate" TO automation_completion_certificate;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationProgressReminders') THEN
        ALTER TABLE courses RENAME COLUMN "AutomationProgressReminders" TO automation_progress_reminders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AutomationAbandonmentSequence') THEN
        ALTER TABLE courses RENAME COLUMN "AutomationAbandonmentSequence" TO automation_abandonment_sequence;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'IsPublished' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_published')) THEN
        ALTER TABLE courses RENAME COLUMN "IsPublished" TO is_published_ghl;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PublishedAt') THEN
        ALTER TABLE courses RENAME COLUMN "PublishedAt" TO published_at;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'ShortDescription') THEN
        ALTER TABLE courses RENAME COLUMN "ShortDescription" TO short_description;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'PromoVideoUrl') THEN
        ALTER TABLE courses RENAME COLUMN "PromoVideoUrl" TO promo_video_url;
    END IF;
END $$;

-- Show final column names
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;