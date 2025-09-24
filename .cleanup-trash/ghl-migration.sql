START TRANSACTION;
ALTER TABLE "Courses" ALTER COLUMN "Duration" DROP NOT NULL;

ALTER TABLE "Courses" ADD "AccessDuration" integer;

ALTER TABLE "Courses" ADD "AccessType" integer NOT NULL DEFAULT 0;

ALTER TABLE "Courses" ADD "AutomationAbandonmentSequence" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "AutomationCompletionCertificate" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "AutomationProgressReminders" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "AutomationWelcomeEmail" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "CourseType" integer NOT NULL DEFAULT 0;

ALTER TABLE "Courses" ADD "Currency" text NOT NULL DEFAULT '';

ALTER TABLE "Courses" ADD "DripContent" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "DripScheduleJson" text;

ALTER TABLE "Courses" ADD "EnrollmentLimit" integer;

ALTER TABLE "Courses" ADD "HasAssignments" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "HasCertificate" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "HasCommunity" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "HasDownloadableResources" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "HasLiveSessions" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "HasQuizzes" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "IsPublished" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Courses" ADD "Language" text NOT NULL DEFAULT '';

ALTER TABLE "Courses" ADD "PaymentPlanDetailsJson" text;

ALTER TABLE "Courses" ADD "PricingModel" integer NOT NULL DEFAULT 0;

ALTER TABLE "Courses" ADD "PromoVideoUrl" text;

ALTER TABLE "Courses" ADD "PublishedAt" timestamp with time zone;

ALTER TABLE "Courses" ADD "ShortDescription" text;

ALTER TABLE "Courses" ADD "SubscriptionPeriod" integer;

ALTER TABLE "Courses" ADD "ThumbnailUrl" text;

CREATE TABLE "CourseApprovals" (
    "Id" uuid NOT NULL,
    "CourseId" integer NOT NULL,
    "SubmittedById" text NOT NULL,
    "ReviewedById" text,
    "Status" text NOT NULL,
    "Feedback" text,
    "SubmittedAt" timestamp with time zone NOT NULL,
    "ReviewedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_CourseApprovals" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CourseApprovals_AspNetUsers_ReviewedById" FOREIGN KEY ("ReviewedById") REFERENCES "AspNetUsers" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_CourseApprovals_AspNetUsers_SubmittedById" FOREIGN KEY ("SubmittedById") REFERENCES "AspNetUsers" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_CourseApprovals_Courses_CourseId" FOREIGN KEY ("CourseId") REFERENCES "Courses" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_CourseApprovals_CourseId" ON "CourseApprovals" ("CourseId");

CREATE INDEX "IX_CourseApprovals_ReviewedById" ON "CourseApprovals" ("ReviewedById");

CREATE INDEX "IX_CourseApprovals_SubmittedById" ON "CourseApprovals" ("SubmittedById");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250730093650_AddGoHighLevelCourseFields', '9.0.7');

COMMIT;

