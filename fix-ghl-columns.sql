-- Add Go High Level specific columns to Courses table
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "CourseType" integer NOT NULL DEFAULT 3;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "PricingModel" integer NOT NULL DEFAULT 1;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "Currency" text NOT NULL DEFAULT 'PHP';
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "SubscriptionPeriod" integer;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "PaymentPlanDetailsJson" text;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "AccessType" integer NOT NULL DEFAULT 0;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "AccessDuration" integer;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "EnrollmentLimit" integer;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "Language" text NOT NULL DEFAULT 'en';
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "HasCertificate" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "HasCommunity" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "HasLiveSessions" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "HasDownloadableResources" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "HasAssignments" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "HasQuizzes" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "DripContent" boolean NOT NULL DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "DripScheduleJson" text;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "AutomationWelcomeEmail" boolean NOT NULL DEFAULT true;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "AutomationCompletionCertificate" boolean NOT NULL DEFAULT true;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "AutomationProgressReminders" boolean NOT NULL DEFAULT true;
ALTER TABLE "Courses" ADD COLUMN IF NOT EXISTS "AutomationAbandonmentSequence" boolean NOT NULL DEFAULT false;

-- Update migration history
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250730093650_AddGoHighLevelCourseFields', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;