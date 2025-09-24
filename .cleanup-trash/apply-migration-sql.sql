-- Add columns to SubscriptionPlans table
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "DisplayOrder" integer NOT NULL DEFAULT 0;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "HasAnalytics" boolean NOT NULL DEFAULT false;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "HasPrioritySupport" boolean NOT NULL DEFAULT false;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "IsRecommended" boolean NOT NULL DEFAULT false;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "MaxCoursesCanCreate" integer;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "MaxStudentsPerCourse" integer;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "PlanType" integer NOT NULL DEFAULT 0;
ALTER TABLE "SubscriptionPlans" ADD COLUMN IF NOT EXISTS "TransactionFeePercentage" numeric;

-- Add column to Reviews table
ALTER TABLE "Reviews" ADD COLUMN IF NOT EXISTS "IsFlagged" boolean NOT NULL DEFAULT false;

-- Update EF Core migration history
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250728152206_AddSubscriptionAndReviewFields', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;