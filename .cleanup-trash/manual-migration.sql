-- Manual migration for SubscriptionPlan and Review updates
-- Run this in your PostgreSQL database

-- Add new columns to SubscriptionPlans table
ALTER TABLE "SubscriptionPlans" 
ADD COLUMN IF NOT EXISTS "PlanType" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "MaxCoursesCanCreate" integer,
ADD COLUMN IF NOT EXISTS "MaxStudentsPerCourse" integer,
ADD COLUMN IF NOT EXISTS "TransactionFeePercentage" numeric,
ADD COLUMN IF NOT EXISTS "HasAnalytics" boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "HasPrioritySupport" boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "DisplayOrder" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "IsRecommended" boolean NOT NULL DEFAULT false;

-- Add IsFlagged column to Reviews table
ALTER TABLE "Reviews" 
ADD COLUMN IF NOT EXISTS "IsFlagged" boolean NOT NULL DEFAULT false;

-- Update existing subscription plans to be Learner type
UPDATE "SubscriptionPlans" 
SET "PlanType" = 0 
WHERE "PlanType" IS NULL OR "PlanType" = 0;

-- Clear existing subscription plans to reseed with new data
TRUNCATE TABLE "SubscriptionPlans" CASCADE;

SELECT 'Migration completed successfully!' as result;