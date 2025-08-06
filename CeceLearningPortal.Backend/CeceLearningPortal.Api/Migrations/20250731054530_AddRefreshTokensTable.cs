using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CeceLearningPortal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokensTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseApprovals_AspNetUsers_ReviewedById",
                table: "CourseApprovals");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseApprovals_AspNetUsers_SubmittedById",
                table: "CourseApprovals");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseApprovals_Courses_CourseId",
                table: "CourseApprovals");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseModules_Courses_CourseId",
                table: "CourseModules");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_AspNetUsers_InstructorId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_AspNetUsers_StudentId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Courses_CourseId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_InstructorApprovals_AspNetUsers_UserId",
                table: "InstructorApprovals");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonProgresses_AspNetUsers_StudentId",
                table: "LessonProgresses");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonProgresses_Lessons_LessonId",
                table: "LessonProgresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_CourseModules_ModuleId",
                table: "Lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_PasswordHistories_AspNetUsers_UserId",
                table: "PasswordHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_AspNetUsers_UserId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Courses_CourseId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Subscriptions_SubscriptionId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_AspNetUsers_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AspNetUsers_StudentId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Courses_CourseId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_AspNetUsers_UserId",
                table: "Subscriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_SubscriptionPlans_SubscriptionPlanId",
                table: "Subscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Subscriptions",
                table: "Subscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Enrollments",
                table: "Enrollments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Courses",
                table: "Courses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetUserTokens",
                table: "AspNetUserTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetUserRoles",
                table: "AspNetUserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetUserLogins",
                table: "AspNetUserLogins");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetUserClaims",
                table: "AspNetUserClaims");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetRoleClaims",
                table: "AspNetRoleClaims");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SubscriptionPlans",
                table: "SubscriptionPlans");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Payments",
                table: "Payments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PasswordHistories",
                table: "PasswordHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Lessons",
                table: "Lessons");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LessonProgresses",
                table: "LessonProgresses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InstructorApprovals",
                table: "InstructorApprovals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseModules",
                table: "CourseModules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseApprovals",
                table: "CourseApprovals");

            migrationBuilder.RenameTable(
                name: "Subscriptions",
                newName: "subscriptions");

            migrationBuilder.RenameTable(
                name: "Enrollments",
                newName: "enrollments");

            migrationBuilder.RenameTable(
                name: "Courses",
                newName: "courses");

            migrationBuilder.RenameTable(
                name: "SubscriptionPlans",
                newName: "subscription_plans");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "course_reviews");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "refresh_tokens");

            migrationBuilder.RenameTable(
                name: "Payments",
                newName: "transactions");

            migrationBuilder.RenameTable(
                name: "PasswordHistories",
                newName: "sessions");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "activities");

            migrationBuilder.RenameTable(
                name: "Lessons",
                newName: "course_lessons");

            migrationBuilder.RenameTable(
                name: "LessonProgresses",
                newName: "lesson_progress");

            migrationBuilder.RenameTable(
                name: "InstructorApprovals",
                newName: "instructor_approvals");

            migrationBuilder.RenameTable(
                name: "CourseModules",
                newName: "course_modules");

            migrationBuilder.RenameTable(
                name: "CourseApprovals",
                newName: "course_approvals");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "subscriptions",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "subscriptions",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "subscriptions",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "subscriptions",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "subscriptions",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "SubscriptionPlanId",
                table: "subscriptions",
                newName: "subscription_plan_id");

            migrationBuilder.RenameColumn(
                name: "StripeSubscriptionId",
                table: "subscriptions",
                newName: "stripe_subscription_id");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "subscriptions",
                newName: "start_date");

            migrationBuilder.RenameColumn(
                name: "PlanName",
                table: "subscriptions",
                newName: "plan_name");

            migrationBuilder.RenameColumn(
                name: "NextBillingDate",
                table: "subscriptions",
                newName: "next_billing_date");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "subscriptions",
                newName: "end_date");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "subscriptions",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "BillingCycle",
                table: "subscriptions",
                newName: "billing_cycle");

            migrationBuilder.RenameIndex(
                name: "IX_Subscriptions_UserId",
                table: "subscriptions",
                newName: "i_x_subscriptions_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_Subscriptions_SubscriptionPlanId",
                table: "subscriptions",
                newName: "i_x_subscriptions_subscription_plan_id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "enrollments",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "TotalTimeSpent",
                table: "enrollments",
                newName: "total_time_spent");

            migrationBuilder.RenameColumn(
                name: "StudentId",
                table: "enrollments",
                newName: "student_id");

            migrationBuilder.RenameColumn(
                name: "QuizCount",
                table: "enrollments",
                newName: "quiz_count");

            migrationBuilder.RenameColumn(
                name: "ProgressPercentage",
                table: "enrollments",
                newName: "progress_percentage");

            migrationBuilder.RenameColumn(
                name: "LastAccessedDate",
                table: "enrollments",
                newName: "last_accessed_date");

            migrationBuilder.RenameColumn(
                name: "EnrolledAt",
                table: "enrollments",
                newName: "enrolled_at");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "enrollments",
                newName: "course_id");

            migrationBuilder.RenameColumn(
                name: "CompletedLessons",
                table: "enrollments",
                newName: "completed_lessons");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "enrollments",
                newName: "completed_at");

            migrationBuilder.RenameColumn(
                name: "CertificateUrl",
                table: "enrollments",
                newName: "certificate_url");

            migrationBuilder.RenameColumn(
                name: "CertificateIssued",
                table: "enrollments",
                newName: "certificate_issued");

            migrationBuilder.RenameColumn(
                name: "AverageQuizScore",
                table: "enrollments",
                newName: "average_quiz_score");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_StudentId_CourseId",
                table: "enrollments",
                newName: "IX_enrollments_student_id_course_id");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_CourseId",
                table: "enrollments",
                newName: "i_x_enrollments_course_id");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "courses",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Thumbnail",
                table: "courses",
                newName: "thumbnail");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "courses",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "courses",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "Level",
                table: "courses",
                newName: "level");

            migrationBuilder.RenameColumn(
                name: "Features",
                table: "courses",
                newName: "features");

            migrationBuilder.RenameColumn(
                name: "Duration",
                table: "courses",
                newName: "duration");

            migrationBuilder.RenameColumn(
                name: "Discount",
                table: "courses",
                newName: "discount");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "courses",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "courses",
                newName: "category");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "courses",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "courses",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "ThumbnailUrl",
                table: "courses",
                newName: "thumbnail_url");

            migrationBuilder.RenameColumn(
                name: "PreviewUrl",
                table: "courses",
                newName: "preview_url");

            migrationBuilder.RenameColumn(
                name: "OriginalPrice",
                table: "courses",
                newName: "original_price");

            migrationBuilder.RenameColumn(
                name: "IsBestseller",
                table: "courses",
                newName: "is_bestseller");

            migrationBuilder.RenameColumn(
                name: "InstructorId",
                table: "courses",
                newName: "instructor_id");

            migrationBuilder.RenameColumn(
                name: "EnrollmentType",
                table: "courses",
                newName: "enrollment_type");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "courses",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_Status",
                table: "courses",
                newName: "IX_courses_status");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_Category",
                table: "courses",
                newName: "IX_courses_category");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_InstructorId",
                table: "courses",
                newName: "i_x_courses_instructor_id");

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "AspNetUserTokens",
                newName: "value");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "AspNetUserTokens",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "LoginProvider",
                table: "AspNetUserTokens",
                newName: "login_provider");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "AspNetUserTokens",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "AspNetUserRoles",
                newName: "role_id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "AspNetUserRoles",
                newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                newName: "i_x__asp_net_user_roles_role_id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "AspNetUserLogins",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "ProviderDisplayName",
                table: "AspNetUserLogins",
                newName: "provider_display_name");

            migrationBuilder.RenameColumn(
                name: "ProviderKey",
                table: "AspNetUserLogins",
                newName: "provider_key");

            migrationBuilder.RenameColumn(
                name: "LoginProvider",
                table: "AspNetUserLogins",
                newName: "login_provider");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                newName: "i_x__asp_net_user_logins_user_id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "AspNetUserClaims",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "AspNetUserClaims",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "ClaimValue",
                table: "AspNetUserClaims",
                newName: "claim_value");

            migrationBuilder.RenameColumn(
                name: "ClaimType",
                table: "AspNetUserClaims",
                newName: "claim_type");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                newName: "i_x__asp_net_user_claims_user_id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "AspNetRoleClaims",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "AspNetRoleClaims",
                newName: "role_id");

            migrationBuilder.RenameColumn(
                name: "ClaimValue",
                table: "AspNetRoleClaims",
                newName: "claim_value");

            migrationBuilder.RenameColumn(
                name: "ClaimType",
                table: "AspNetRoleClaims",
                newName: "claim_type");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                newName: "i_x__asp_net_role_claims_role_id");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "subscription_plans",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Features",
                table: "subscription_plans",
                newName: "features");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "subscription_plans",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "subscription_plans",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "YearlyPrice",
                table: "subscription_plans",
                newName: "yearly_price");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "subscription_plans",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "TransactionFeePercentage",
                table: "subscription_plans",
                newName: "transaction_fee_percentage");

            migrationBuilder.RenameColumn(
                name: "PlanType",
                table: "subscription_plans",
                newName: "plan_type");

            migrationBuilder.RenameColumn(
                name: "MonthlyPrice",
                table: "subscription_plans",
                newName: "monthly_price");

            migrationBuilder.RenameColumn(
                name: "MaxStudentsPerCourse",
                table: "subscription_plans",
                newName: "max_students_per_course");

            migrationBuilder.RenameColumn(
                name: "MaxCoursesCanCreate",
                table: "subscription_plans",
                newName: "max_courses_can_create");

            migrationBuilder.RenameColumn(
                name: "MaxCourseAccess",
                table: "subscription_plans",
                newName: "max_course_access");

            migrationBuilder.RenameColumn(
                name: "IsRecommended",
                table: "subscription_plans",
                newName: "is_recommended");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "subscription_plans",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "HasUnlimitedAccess",
                table: "subscription_plans",
                newName: "has_unlimited_access");

            migrationBuilder.RenameColumn(
                name: "HasPrioritySupport",
                table: "subscription_plans",
                newName: "has_priority_support");

            migrationBuilder.RenameColumn(
                name: "HasAnalytics",
                table: "subscription_plans",
                newName: "has_analytics");

            migrationBuilder.RenameColumn(
                name: "DisplayOrder",
                table: "subscription_plans",
                newName: "display_order");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "subscription_plans",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "course_reviews",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Rating",
                table: "course_reviews",
                newName: "rating");

            migrationBuilder.RenameColumn(
                name: "Comment",
                table: "course_reviews",
                newName: "comment");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "course_reviews",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "StudentId",
                table: "course_reviews",
                newName: "student_id");

            migrationBuilder.RenameColumn(
                name: "IsFlagged",
                table: "course_reviews",
                newName: "is_flagged");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "course_reviews",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "course_reviews",
                newName: "course_id");

            migrationBuilder.RenameColumn(
                name: "ApprovedBy",
                table: "course_reviews",
                newName: "approved_by");

            migrationBuilder.RenameColumn(
                name: "ApprovedAt",
                table: "course_reviews",
                newName: "approved_at");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_StudentId",
                table: "course_reviews",
                newName: "i_x_reviews_student_id");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_CourseId",
                table: "course_reviews",
                newName: "i_x_reviews_course_id");

            migrationBuilder.RenameColumn(
                name: "Token",
                table: "refresh_tokens",
                newName: "token");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "refresh_tokens",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "refresh_tokens",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "RevokedByIp",
                table: "refresh_tokens",
                newName: "revoked_by_ip");

            migrationBuilder.RenameColumn(
                name: "RevokedAt",
                table: "refresh_tokens",
                newName: "revoked_at");

            migrationBuilder.RenameColumn(
                name: "ReplacedByToken",
                table: "refresh_tokens",
                newName: "replaced_by_token");

            migrationBuilder.RenameColumn(
                name: "ExpiresAt",
                table: "refresh_tokens",
                newName: "expires_at");

            migrationBuilder.RenameColumn(
                name: "CreatedByIp",
                table: "refresh_tokens",
                newName: "created_by_ip");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "refresh_tokens",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_RefreshTokens_UserId",
                table: "refresh_tokens",
                newName: "i_x_refresh_tokens_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_RefreshTokens_Token",
                table: "refresh_tokens",
                newName: "IX_refresh_tokens_token");

            migrationBuilder.RenameIndex(
                name: "IX_RefreshTokens_ExpiresAt",
                table: "refresh_tokens",
                newName: "IX_refresh_tokens_expires_at");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "transactions",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "transactions",
                newName: "currency");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "transactions",
                newName: "amount");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "transactions",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "transactions",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "TransactionId",
                table: "transactions",
                newName: "transaction_id");

            migrationBuilder.RenameColumn(
                name: "SubscriptionId",
                table: "transactions",
                newName: "subscription_id");

            migrationBuilder.RenameColumn(
                name: "ProcessedAt",
                table: "transactions",
                newName: "processed_at");

            migrationBuilder.RenameColumn(
                name: "PaymentMethod",
                table: "transactions",
                newName: "payment_method");

            migrationBuilder.RenameColumn(
                name: "PaymentIntentId",
                table: "transactions",
                newName: "payment_intent_id");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "transactions",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "transactions",
                newName: "course_id");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_UserId",
                table: "transactions",
                newName: "i_x_payments_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_SubscriptionId",
                table: "transactions",
                newName: "i_x_payments_subscription_id");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_CourseId",
                table: "transactions",
                newName: "i_x_payments_course_id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "sessions",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "sessions",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "sessions",
                newName: "password_hash");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "sessions",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_PasswordHistories_UserId",
                table: "sessions",
                newName: "i_x_password_histories_user_id");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "activities",
                newName: "type");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "activities",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "activities",
                newName: "message");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "activities",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "activities",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "activities",
                newName: "is_read");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "activities",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "ActionUrl",
                table: "activities",
                newName: "action_url");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserId",
                table: "activities",
                newName: "i_x_notifications_user_id");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "course_lessons",
                newName: "type");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "course_lessons",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "course_lessons",
                newName: "order");

            migrationBuilder.RenameColumn(
                name: "Duration",
                table: "course_lessons",
                newName: "duration");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "course_lessons",
                newName: "content");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "course_lessons",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "VideoUrl",
                table: "course_lessons",
                newName: "video_url");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "course_lessons",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "ModuleId",
                table: "course_lessons",
                newName: "module_id");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "course_lessons",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Lessons_ModuleId",
                table: "course_lessons",
                newName: "i_x_lessons_module_id");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "lesson_progress",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "lesson_progress",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "StudentId",
                table: "lesson_progress",
                newName: "student_id");

            migrationBuilder.RenameColumn(
                name: "StartedAt",
                table: "lesson_progress",
                newName: "started_at");

            migrationBuilder.RenameColumn(
                name: "QuizScore",
                table: "lesson_progress",
                newName: "quiz_score");

            migrationBuilder.RenameColumn(
                name: "LessonId",
                table: "lesson_progress",
                newName: "lesson_id");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "lesson_progress",
                newName: "completed_at");

            migrationBuilder.RenameColumn(
                name: "AssignmentSubmissionUrl",
                table: "lesson_progress",
                newName: "assignment_submission_url");

            migrationBuilder.RenameIndex(
                name: "IX_LessonProgresses_StudentId_LessonId",
                table: "lesson_progress",
                newName: "IX_lesson_progress_student_id_lesson_id");

            migrationBuilder.RenameIndex(
                name: "IX_LessonProgresses_LessonId",
                table: "lesson_progress",
                newName: "i_x_lesson_progresses_lesson_id");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "instructor_approvals",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Qualifications",
                table: "instructor_approvals",
                newName: "qualifications");

            migrationBuilder.RenameColumn(
                name: "Bio",
                table: "instructor_approvals",
                newName: "bio");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "instructor_approvals",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "WebsiteUrl",
                table: "instructor_approvals",
                newName: "website_url");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "instructor_approvals",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "TeachingExperience",
                table: "instructor_approvals",
                newName: "teaching_experience");

            migrationBuilder.RenameColumn(
                name: "SubmittedAt",
                table: "instructor_approvals",
                newName: "submitted_at");

            migrationBuilder.RenameColumn(
                name: "ReviewerNotes",
                table: "instructor_approvals",
                newName: "reviewer_notes");

            migrationBuilder.RenameColumn(
                name: "ReviewedBy",
                table: "instructor_approvals",
                newName: "reviewed_by");

            migrationBuilder.RenameColumn(
                name: "ReviewedAt",
                table: "instructor_approvals",
                newName: "reviewed_at");

            migrationBuilder.RenameColumn(
                name: "LinkedInProfile",
                table: "instructor_approvals",
                newName: "linked_in_profile");

            migrationBuilder.RenameIndex(
                name: "IX_InstructorApprovals_UserId",
                table: "instructor_approvals",
                newName: "i_x_instructor_approvals_user_id");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "course_modules",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "course_modules",
                newName: "order");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "course_modules",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "course_modules",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "course_modules",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "course_modules",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "course_modules",
                newName: "course_id");

            migrationBuilder.RenameIndex(
                name: "IX_CourseModules_CourseId",
                table: "course_modules",
                newName: "i_x_course_modules_course_id");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "course_approvals",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Feedback",
                table: "course_approvals",
                newName: "feedback");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "course_approvals",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "course_approvals",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "SubmittedById",
                table: "course_approvals",
                newName: "submitted_by_id");

            migrationBuilder.RenameColumn(
                name: "SubmittedAt",
                table: "course_approvals",
                newName: "submitted_at");

            migrationBuilder.RenameColumn(
                name: "ReviewedById",
                table: "course_approvals",
                newName: "reviewed_by_id");

            migrationBuilder.RenameColumn(
                name: "ReviewedAt",
                table: "course_approvals",
                newName: "reviewed_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "course_approvals",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "course_approvals",
                newName: "course_id");

            migrationBuilder.RenameIndex(
                name: "IX_CourseApprovals_SubmittedById",
                table: "course_approvals",
                newName: "i_x_course_approvals_submitted_by_id");

            migrationBuilder.RenameIndex(
                name: "IX_CourseApprovals_ReviewedById",
                table: "course_approvals",
                newName: "i_x_course_approvals_reviewed_by_id");

            migrationBuilder.RenameIndex(
                name: "IX_CourseApprovals_CourseId",
                table: "course_approvals",
                newName: "i_x_course_approvals_course_id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_subscriptions",
                table: "subscriptions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_enrollments",
                table: "enrollments",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_courses",
                table: "courses",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k__asp_net_user_tokens",
                table: "AspNetUserTokens",
                columns: new[] { "user_id", "login_provider", "name" });

            migrationBuilder.AddPrimaryKey(
                name: "p_k__asp_net_user_roles",
                table: "AspNetUserRoles",
                columns: new[] { "user_id", "role_id" });

            migrationBuilder.AddPrimaryKey(
                name: "p_k__asp_net_user_logins",
                table: "AspNetUserLogins",
                columns: new[] { "login_provider", "provider_key" });

            migrationBuilder.AddPrimaryKey(
                name: "p_k__asp_net_user_claims",
                table: "AspNetUserClaims",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k__asp_net_role_claims",
                table: "AspNetRoleClaims",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_subscription_plans",
                table: "subscription_plans",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_reviews",
                table: "course_reviews",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_refresh_tokens",
                table: "refresh_tokens",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_payments",
                table: "transactions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_password_histories",
                table: "sessions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_notifications",
                table: "activities",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_lessons",
                table: "course_lessons",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_lesson_progresses",
                table: "lesson_progress",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_instructor_approvals",
                table: "instructor_approvals",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_course_modules",
                table: "course_modules",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_course_approvals",
                table: "course_approvals",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "f_k_notifications__asp_net_users_user_id",
                table: "activities",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k__asp_net_role_claims__asp_net_roles_role_id",
                table: "AspNetRoleClaims",
                column: "role_id",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k__asp_net_user_claims__asp_net_users_user_id",
                table: "AspNetUserClaims",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k__asp_net_user_logins__asp_net_users_user_id",
                table: "AspNetUserLogins",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k__asp_net_user_roles__asp_net_roles_role_id",
                table: "AspNetUserRoles",
                column: "role_id",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k__asp_net_user_roles__asp_net_users_user_id",
                table: "AspNetUserRoles",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k__asp_net_user_tokens__asp_net_users_user_id",
                table: "AspNetUserTokens",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_course_approvals__asp_net_users_reviewed_by_id",
                table: "course_approvals",
                column: "reviewed_by_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_course_approvals__asp_net_users_submitted_by_id",
                table: "course_approvals",
                column: "submitted_by_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_course_approvals_courses_course_id",
                table: "course_approvals",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_lessons_course_modules_module_id",
                table: "course_lessons",
                column: "module_id",
                principalTable: "course_modules",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_course_modules_courses_course_id",
                table: "course_modules",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_reviews__asp_net_users_student_id",
                table: "course_reviews",
                column: "student_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_reviews_courses_course_id",
                table: "course_reviews",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_courses__asp_net_users_instructor_id",
                table: "courses",
                column: "instructor_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_enrollments__asp_net_users_student_id",
                table: "enrollments",
                column: "student_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_enrollments_courses_course_id",
                table: "enrollments",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_instructor_approvals__asp_net_users_user_id",
                table: "instructor_approvals",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_lesson_progresses__asp_net_users_student_id",
                table: "lesson_progress",
                column: "student_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_lesson_progresses_lessons_lesson_id",
                table: "lesson_progress",
                column: "lesson_id",
                principalTable: "course_lessons",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_refresh_tokens__asp_net_users_user_id",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_password_histories__asp_net_users_user_id",
                table: "sessions",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_subscriptions__asp_net_users_user_id",
                table: "subscriptions",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_subscriptions__subscription_plans_subscription_plan_id",
                table: "subscriptions",
                column: "subscription_plan_id",
                principalTable: "subscription_plans",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_payments__asp_net_users_user_id",
                table: "transactions",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_payments__subscriptions_subscription_id",
                table: "transactions",
                column: "subscription_id",
                principalTable: "subscriptions",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "f_k_payments_courses_course_id",
                table: "transactions",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_notifications__asp_net_users_user_id",
                table: "activities");

            migrationBuilder.DropForeignKey(
                name: "f_k__asp_net_role_claims__asp_net_roles_role_id",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "f_k__asp_net_user_claims__asp_net_users_user_id",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "f_k__asp_net_user_logins__asp_net_users_user_id",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "f_k__asp_net_user_roles__asp_net_roles_role_id",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "f_k__asp_net_user_roles__asp_net_users_user_id",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "f_k__asp_net_user_tokens__asp_net_users_user_id",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "f_k_course_approvals__asp_net_users_reviewed_by_id",
                table: "course_approvals");

            migrationBuilder.DropForeignKey(
                name: "f_k_course_approvals__asp_net_users_submitted_by_id",
                table: "course_approvals");

            migrationBuilder.DropForeignKey(
                name: "f_k_course_approvals_courses_course_id",
                table: "course_approvals");

            migrationBuilder.DropForeignKey(
                name: "f_k_lessons_course_modules_module_id",
                table: "course_lessons");

            migrationBuilder.DropForeignKey(
                name: "f_k_course_modules_courses_course_id",
                table: "course_modules");

            migrationBuilder.DropForeignKey(
                name: "f_k_reviews__asp_net_users_student_id",
                table: "course_reviews");

            migrationBuilder.DropForeignKey(
                name: "f_k_reviews_courses_course_id",
                table: "course_reviews");

            migrationBuilder.DropForeignKey(
                name: "f_k_courses__asp_net_users_instructor_id",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "f_k_enrollments__asp_net_users_student_id",
                table: "enrollments");

            migrationBuilder.DropForeignKey(
                name: "f_k_enrollments_courses_course_id",
                table: "enrollments");

            migrationBuilder.DropForeignKey(
                name: "f_k_instructor_approvals__asp_net_users_user_id",
                table: "instructor_approvals");

            migrationBuilder.DropForeignKey(
                name: "f_k_lesson_progresses__asp_net_users_student_id",
                table: "lesson_progress");

            migrationBuilder.DropForeignKey(
                name: "f_k_lesson_progresses_lessons_lesson_id",
                table: "lesson_progress");

            migrationBuilder.DropForeignKey(
                name: "f_k_refresh_tokens__asp_net_users_user_id",
                table: "refresh_tokens");

            migrationBuilder.DropForeignKey(
                name: "f_k_password_histories__asp_net_users_user_id",
                table: "sessions");

            migrationBuilder.DropForeignKey(
                name: "f_k_subscriptions__asp_net_users_user_id",
                table: "subscriptions");

            migrationBuilder.DropForeignKey(
                name: "f_k_subscriptions__subscription_plans_subscription_plan_id",
                table: "subscriptions");

            migrationBuilder.DropForeignKey(
                name: "f_k_payments__asp_net_users_user_id",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "f_k_payments__subscriptions_subscription_id",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "f_k_payments_courses_course_id",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_subscriptions",
                table: "subscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_enrollments",
                table: "enrollments");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_courses",
                table: "courses");

            migrationBuilder.DropPrimaryKey(
                name: "p_k__asp_net_user_tokens",
                table: "AspNetUserTokens");

            migrationBuilder.DropPrimaryKey(
                name: "p_k__asp_net_user_roles",
                table: "AspNetUserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "p_k__asp_net_user_logins",
                table: "AspNetUserLogins");

            migrationBuilder.DropPrimaryKey(
                name: "p_k__asp_net_user_claims",
                table: "AspNetUserClaims");

            migrationBuilder.DropPrimaryKey(
                name: "p_k__asp_net_role_claims",
                table: "AspNetRoleClaims");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_payments",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_subscription_plans",
                table: "subscription_plans");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_password_histories",
                table: "sessions");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_refresh_tokens",
                table: "refresh_tokens");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_lesson_progresses",
                table: "lesson_progress");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_instructor_approvals",
                table: "instructor_approvals");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_reviews",
                table: "course_reviews");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_course_modules",
                table: "course_modules");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_lessons",
                table: "course_lessons");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_course_approvals",
                table: "course_approvals");

            migrationBuilder.DropPrimaryKey(
                name: "p_k_notifications",
                table: "activities");

            migrationBuilder.RenameTable(
                name: "subscriptions",
                newName: "Subscriptions");

            migrationBuilder.RenameTable(
                name: "enrollments",
                newName: "Enrollments");

            migrationBuilder.RenameTable(
                name: "courses",
                newName: "Courses");

            migrationBuilder.RenameTable(
                name: "transactions",
                newName: "Payments");

            migrationBuilder.RenameTable(
                name: "subscription_plans",
                newName: "SubscriptionPlans");

            migrationBuilder.RenameTable(
                name: "sessions",
                newName: "PasswordHistories");

            migrationBuilder.RenameTable(
                name: "refresh_tokens",
                newName: "RefreshTokens");

            migrationBuilder.RenameTable(
                name: "lesson_progress",
                newName: "LessonProgresses");

            migrationBuilder.RenameTable(
                name: "instructor_approvals",
                newName: "InstructorApprovals");

            migrationBuilder.RenameTable(
                name: "course_reviews",
                newName: "Reviews");

            migrationBuilder.RenameTable(
                name: "course_modules",
                newName: "CourseModules");

            migrationBuilder.RenameTable(
                name: "course_lessons",
                newName: "Lessons");

            migrationBuilder.RenameTable(
                name: "course_approvals",
                newName: "CourseApprovals");

            migrationBuilder.RenameTable(
                name: "activities",
                newName: "Notifications");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Subscriptions",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "Subscriptions",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Subscriptions",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Subscriptions",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Subscriptions",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "subscription_plan_id",
                table: "Subscriptions",
                newName: "SubscriptionPlanId");

            migrationBuilder.RenameColumn(
                name: "stripe_subscription_id",
                table: "Subscriptions",
                newName: "StripeSubscriptionId");

            migrationBuilder.RenameColumn(
                name: "start_date",
                table: "Subscriptions",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "plan_name",
                table: "Subscriptions",
                newName: "PlanName");

            migrationBuilder.RenameColumn(
                name: "next_billing_date",
                table: "Subscriptions",
                newName: "NextBillingDate");

            migrationBuilder.RenameColumn(
                name: "end_date",
                table: "Subscriptions",
                newName: "EndDate");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Subscriptions",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "billing_cycle",
                table: "Subscriptions",
                newName: "BillingCycle");

            migrationBuilder.RenameIndex(
                name: "i_x_subscriptions_user_id",
                table: "Subscriptions",
                newName: "IX_Subscriptions_UserId");

            migrationBuilder.RenameIndex(
                name: "i_x_subscriptions_subscription_plan_id",
                table: "Subscriptions",
                newName: "IX_Subscriptions_SubscriptionPlanId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Enrollments",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "total_time_spent",
                table: "Enrollments",
                newName: "TotalTimeSpent");

            migrationBuilder.RenameColumn(
                name: "student_id",
                table: "Enrollments",
                newName: "StudentId");

            migrationBuilder.RenameColumn(
                name: "quiz_count",
                table: "Enrollments",
                newName: "QuizCount");

            migrationBuilder.RenameColumn(
                name: "progress_percentage",
                table: "Enrollments",
                newName: "ProgressPercentage");

            migrationBuilder.RenameColumn(
                name: "last_accessed_date",
                table: "Enrollments",
                newName: "LastAccessedDate");

            migrationBuilder.RenameColumn(
                name: "enrolled_at",
                table: "Enrollments",
                newName: "EnrolledAt");

            migrationBuilder.RenameColumn(
                name: "course_id",
                table: "Enrollments",
                newName: "CourseId");

            migrationBuilder.RenameColumn(
                name: "completed_lessons",
                table: "Enrollments",
                newName: "CompletedLessons");

            migrationBuilder.RenameColumn(
                name: "completed_at",
                table: "Enrollments",
                newName: "CompletedAt");

            migrationBuilder.RenameColumn(
                name: "certificate_url",
                table: "Enrollments",
                newName: "CertificateUrl");

            migrationBuilder.RenameColumn(
                name: "certificate_issued",
                table: "Enrollments",
                newName: "CertificateIssued");

            migrationBuilder.RenameColumn(
                name: "average_quiz_score",
                table: "Enrollments",
                newName: "AverageQuizScore");

            migrationBuilder.RenameIndex(
                name: "IX_enrollments_student_id_course_id",
                table: "Enrollments",
                newName: "IX_Enrollments_StudentId_CourseId");

            migrationBuilder.RenameIndex(
                name: "i_x_enrollments_course_id",
                table: "Enrollments",
                newName: "IX_Enrollments_CourseId");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Courses",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "thumbnail",
                table: "Courses",
                newName: "Thumbnail");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Courses",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "Courses",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "level",
                table: "Courses",
                newName: "Level");

            migrationBuilder.RenameColumn(
                name: "features",
                table: "Courses",
                newName: "Features");

            migrationBuilder.RenameColumn(
                name: "duration",
                table: "Courses",
                newName: "Duration");

            migrationBuilder.RenameColumn(
                name: "discount",
                table: "Courses",
                newName: "Discount");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Courses",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "category",
                table: "Courses",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Courses",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Courses",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "thumbnail_url",
                table: "Courses",
                newName: "ThumbnailUrl");

            migrationBuilder.RenameColumn(
                name: "preview_url",
                table: "Courses",
                newName: "PreviewUrl");

            migrationBuilder.RenameColumn(
                name: "original_price",
                table: "Courses",
                newName: "OriginalPrice");

            migrationBuilder.RenameColumn(
                name: "is_bestseller",
                table: "Courses",
                newName: "IsBestseller");

            migrationBuilder.RenameColumn(
                name: "instructor_id",
                table: "Courses",
                newName: "InstructorId");

            migrationBuilder.RenameColumn(
                name: "enrollment_type",
                table: "Courses",
                newName: "EnrollmentType");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Courses",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_courses_status",
                table: "Courses",
                newName: "IX_Courses_Status");

            migrationBuilder.RenameIndex(
                name: "IX_courses_category",
                table: "Courses",
                newName: "IX_Courses_Category");

            migrationBuilder.RenameIndex(
                name: "i_x_courses_instructor_id",
                table: "Courses",
                newName: "IX_Courses_InstructorId");

            migrationBuilder.RenameColumn(
                name: "value",
                table: "AspNetUserTokens",
                newName: "Value");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "AspNetUserTokens",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "login_provider",
                table: "AspNetUserTokens",
                newName: "LoginProvider");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "AspNetUserTokens",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "role_id",
                table: "AspNetUserRoles",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "AspNetUserRoles",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "i_x__asp_net_user_roles_role_id",
                table: "AspNetUserRoles",
                newName: "IX_AspNetUserRoles_RoleId");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "AspNetUserLogins",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "provider_display_name",
                table: "AspNetUserLogins",
                newName: "ProviderDisplayName");

            migrationBuilder.RenameColumn(
                name: "provider_key",
                table: "AspNetUserLogins",
                newName: "ProviderKey");

            migrationBuilder.RenameColumn(
                name: "login_provider",
                table: "AspNetUserLogins",
                newName: "LoginProvider");

            migrationBuilder.RenameIndex(
                name: "i_x__asp_net_user_logins_user_id",
                table: "AspNetUserLogins",
                newName: "IX_AspNetUserLogins_UserId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AspNetUserClaims",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "AspNetUserClaims",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "claim_value",
                table: "AspNetUserClaims",
                newName: "ClaimValue");

            migrationBuilder.RenameColumn(
                name: "claim_type",
                table: "AspNetUserClaims",
                newName: "ClaimType");

            migrationBuilder.RenameIndex(
                name: "i_x__asp_net_user_claims_user_id",
                table: "AspNetUserClaims",
                newName: "IX_AspNetUserClaims_UserId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AspNetRoleClaims",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "role_id",
                table: "AspNetRoleClaims",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "claim_value",
                table: "AspNetRoleClaims",
                newName: "ClaimValue");

            migrationBuilder.RenameColumn(
                name: "claim_type",
                table: "AspNetRoleClaims",
                newName: "ClaimType");

            migrationBuilder.RenameIndex(
                name: "i_x__asp_net_role_claims_role_id",
                table: "AspNetRoleClaims",
                newName: "IX_AspNetRoleClaims_RoleId");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Payments",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "currency",
                table: "Payments",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "amount",
                table: "Payments",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Payments",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Payments",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "transaction_id",
                table: "Payments",
                newName: "TransactionId");

            migrationBuilder.RenameColumn(
                name: "subscription_id",
                table: "Payments",
                newName: "SubscriptionId");

            migrationBuilder.RenameColumn(
                name: "processed_at",
                table: "Payments",
                newName: "ProcessedAt");

            migrationBuilder.RenameColumn(
                name: "payment_method",
                table: "Payments",
                newName: "PaymentMethod");

            migrationBuilder.RenameColumn(
                name: "payment_intent_id",
                table: "Payments",
                newName: "PaymentIntentId");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Payments",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "course_id",
                table: "Payments",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "i_x_payments_user_id",
                table: "Payments",
                newName: "IX_Payments_UserId");

            migrationBuilder.RenameIndex(
                name: "i_x_payments_subscription_id",
                table: "Payments",
                newName: "IX_Payments_SubscriptionId");

            migrationBuilder.RenameIndex(
                name: "i_x_payments_course_id",
                table: "Payments",
                newName: "IX_Payments_CourseId");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "SubscriptionPlans",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "features",
                table: "SubscriptionPlans",
                newName: "Features");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "SubscriptionPlans",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "SubscriptionPlans",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "yearly_price",
                table: "SubscriptionPlans",
                newName: "YearlyPrice");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "SubscriptionPlans",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "transaction_fee_percentage",
                table: "SubscriptionPlans",
                newName: "TransactionFeePercentage");

            migrationBuilder.RenameColumn(
                name: "plan_type",
                table: "SubscriptionPlans",
                newName: "PlanType");

            migrationBuilder.RenameColumn(
                name: "monthly_price",
                table: "SubscriptionPlans",
                newName: "MonthlyPrice");

            migrationBuilder.RenameColumn(
                name: "max_students_per_course",
                table: "SubscriptionPlans",
                newName: "MaxStudentsPerCourse");

            migrationBuilder.RenameColumn(
                name: "max_courses_can_create",
                table: "SubscriptionPlans",
                newName: "MaxCoursesCanCreate");

            migrationBuilder.RenameColumn(
                name: "max_course_access",
                table: "SubscriptionPlans",
                newName: "MaxCourseAccess");

            migrationBuilder.RenameColumn(
                name: "is_recommended",
                table: "SubscriptionPlans",
                newName: "IsRecommended");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "SubscriptionPlans",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "has_unlimited_access",
                table: "SubscriptionPlans",
                newName: "HasUnlimitedAccess");

            migrationBuilder.RenameColumn(
                name: "has_priority_support",
                table: "SubscriptionPlans",
                newName: "HasPrioritySupport");

            migrationBuilder.RenameColumn(
                name: "has_analytics",
                table: "SubscriptionPlans",
                newName: "HasAnalytics");

            migrationBuilder.RenameColumn(
                name: "display_order",
                table: "SubscriptionPlans",
                newName: "DisplayOrder");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "SubscriptionPlans",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "PasswordHistories",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "PasswordHistories",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "password_hash",
                table: "PasswordHistories",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "PasswordHistories",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "i_x_password_histories_user_id",
                table: "PasswordHistories",
                newName: "IX_PasswordHistories_UserId");

            migrationBuilder.RenameColumn(
                name: "token",
                table: "RefreshTokens",
                newName: "Token");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "RefreshTokens",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "RefreshTokens",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "revoked_by_ip",
                table: "RefreshTokens",
                newName: "RevokedByIp");

            migrationBuilder.RenameColumn(
                name: "revoked_at",
                table: "RefreshTokens",
                newName: "RevokedAt");

            migrationBuilder.RenameColumn(
                name: "replaced_by_token",
                table: "RefreshTokens",
                newName: "ReplacedByToken");

            migrationBuilder.RenameColumn(
                name: "expires_at",
                table: "RefreshTokens",
                newName: "ExpiresAt");

            migrationBuilder.RenameColumn(
                name: "created_by_ip",
                table: "RefreshTokens",
                newName: "CreatedByIp");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "RefreshTokens",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_refresh_tokens_token",
                table: "RefreshTokens",
                newName: "IX_RefreshTokens_Token");

            migrationBuilder.RenameIndex(
                name: "IX_refresh_tokens_expires_at",
                table: "RefreshTokens",
                newName: "IX_RefreshTokens_ExpiresAt");

            migrationBuilder.RenameIndex(
                name: "i_x_refresh_tokens_user_id",
                table: "RefreshTokens",
                newName: "IX_RefreshTokens_UserId");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "LessonProgresses",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "LessonProgresses",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "student_id",
                table: "LessonProgresses",
                newName: "StudentId");

            migrationBuilder.RenameColumn(
                name: "started_at",
                table: "LessonProgresses",
                newName: "StartedAt");

            migrationBuilder.RenameColumn(
                name: "quiz_score",
                table: "LessonProgresses",
                newName: "QuizScore");

            migrationBuilder.RenameColumn(
                name: "lesson_id",
                table: "LessonProgresses",
                newName: "LessonId");

            migrationBuilder.RenameColumn(
                name: "completed_at",
                table: "LessonProgresses",
                newName: "CompletedAt");

            migrationBuilder.RenameColumn(
                name: "assignment_submission_url",
                table: "LessonProgresses",
                newName: "AssignmentSubmissionUrl");

            migrationBuilder.RenameIndex(
                name: "IX_lesson_progress_student_id_lesson_id",
                table: "LessonProgresses",
                newName: "IX_LessonProgresses_StudentId_LessonId");

            migrationBuilder.RenameIndex(
                name: "i_x_lesson_progresses_lesson_id",
                table: "LessonProgresses",
                newName: "IX_LessonProgresses_LessonId");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "InstructorApprovals",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "qualifications",
                table: "InstructorApprovals",
                newName: "Qualifications");

            migrationBuilder.RenameColumn(
                name: "bio",
                table: "InstructorApprovals",
                newName: "Bio");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "InstructorApprovals",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "website_url",
                table: "InstructorApprovals",
                newName: "WebsiteUrl");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "InstructorApprovals",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "teaching_experience",
                table: "InstructorApprovals",
                newName: "TeachingExperience");

            migrationBuilder.RenameColumn(
                name: "submitted_at",
                table: "InstructorApprovals",
                newName: "SubmittedAt");

            migrationBuilder.RenameColumn(
                name: "reviewer_notes",
                table: "InstructorApprovals",
                newName: "ReviewerNotes");

            migrationBuilder.RenameColumn(
                name: "reviewed_by",
                table: "InstructorApprovals",
                newName: "ReviewedBy");

            migrationBuilder.RenameColumn(
                name: "reviewed_at",
                table: "InstructorApprovals",
                newName: "ReviewedAt");

            migrationBuilder.RenameColumn(
                name: "linked_in_profile",
                table: "InstructorApprovals",
                newName: "LinkedInProfile");

            migrationBuilder.RenameIndex(
                name: "i_x_instructor_approvals_user_id",
                table: "InstructorApprovals",
                newName: "IX_InstructorApprovals_UserId");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Reviews",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "rating",
                table: "Reviews",
                newName: "Rating");

            migrationBuilder.RenameColumn(
                name: "comment",
                table: "Reviews",
                newName: "Comment");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Reviews",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "student_id",
                table: "Reviews",
                newName: "StudentId");

            migrationBuilder.RenameColumn(
                name: "is_flagged",
                table: "Reviews",
                newName: "IsFlagged");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Reviews",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "course_id",
                table: "Reviews",
                newName: "CourseId");

            migrationBuilder.RenameColumn(
                name: "approved_by",
                table: "Reviews",
                newName: "ApprovedBy");

            migrationBuilder.RenameColumn(
                name: "approved_at",
                table: "Reviews",
                newName: "ApprovedAt");

            migrationBuilder.RenameIndex(
                name: "i_x_reviews_student_id",
                table: "Reviews",
                newName: "IX_Reviews_StudentId");

            migrationBuilder.RenameIndex(
                name: "i_x_reviews_course_id",
                table: "Reviews",
                newName: "IX_Reviews_CourseId");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "CourseModules",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "order",
                table: "CourseModules",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "CourseModules",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "CourseModules",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "CourseModules",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "CourseModules",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "course_id",
                table: "CourseModules",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "i_x_course_modules_course_id",
                table: "CourseModules",
                newName: "IX_CourseModules_CourseId");

            migrationBuilder.RenameColumn(
                name: "type",
                table: "Lessons",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Lessons",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "order",
                table: "Lessons",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "duration",
                table: "Lessons",
                newName: "Duration");

            migrationBuilder.RenameColumn(
                name: "content",
                table: "Lessons",
                newName: "Content");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Lessons",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "video_url",
                table: "Lessons",
                newName: "VideoUrl");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Lessons",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "module_id",
                table: "Lessons",
                newName: "ModuleId");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Lessons",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "i_x_lessons_module_id",
                table: "Lessons",
                newName: "IX_Lessons_ModuleId");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "CourseApprovals",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "feedback",
                table: "CourseApprovals",
                newName: "Feedback");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "CourseApprovals",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "CourseApprovals",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "submitted_by_id",
                table: "CourseApprovals",
                newName: "SubmittedById");

            migrationBuilder.RenameColumn(
                name: "submitted_at",
                table: "CourseApprovals",
                newName: "SubmittedAt");

            migrationBuilder.RenameColumn(
                name: "reviewed_by_id",
                table: "CourseApprovals",
                newName: "ReviewedById");

            migrationBuilder.RenameColumn(
                name: "reviewed_at",
                table: "CourseApprovals",
                newName: "ReviewedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "CourseApprovals",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "course_id",
                table: "CourseApprovals",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "i_x_course_approvals_submitted_by_id",
                table: "CourseApprovals",
                newName: "IX_CourseApprovals_SubmittedById");

            migrationBuilder.RenameIndex(
                name: "i_x_course_approvals_reviewed_by_id",
                table: "CourseApprovals",
                newName: "IX_CourseApprovals_ReviewedById");

            migrationBuilder.RenameIndex(
                name: "i_x_course_approvals_course_id",
                table: "CourseApprovals",
                newName: "IX_CourseApprovals_CourseId");

            migrationBuilder.RenameColumn(
                name: "type",
                table: "Notifications",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Notifications",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "message",
                table: "Notifications",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Notifications",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Notifications",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "is_read",
                table: "Notifications",
                newName: "IsRead");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Notifications",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "action_url",
                table: "Notifications",
                newName: "ActionUrl");

            migrationBuilder.RenameIndex(
                name: "i_x_notifications_user_id",
                table: "Notifications",
                newName: "IX_Notifications_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Subscriptions",
                table: "Subscriptions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Enrollments",
                table: "Enrollments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Courses",
                table: "Courses",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetUserTokens",
                table: "AspNetUserTokens",
                columns: new[] { "UserId", "LoginProvider", "Name" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetUserRoles",
                table: "AspNetUserRoles",
                columns: new[] { "UserId", "RoleId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetUserLogins",
                table: "AspNetUserLogins",
                columns: new[] { "LoginProvider", "ProviderKey" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetUserClaims",
                table: "AspNetUserClaims",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetRoleClaims",
                table: "AspNetRoleClaims",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payments",
                table: "Payments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SubscriptionPlans",
                table: "SubscriptionPlans",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PasswordHistories",
                table: "PasswordHistories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LessonProgresses",
                table: "LessonProgresses",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InstructorApprovals",
                table: "InstructorApprovals",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseModules",
                table: "CourseModules",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Lessons",
                table: "Lessons",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseApprovals",
                table: "CourseApprovals",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseApprovals_AspNetUsers_ReviewedById",
                table: "CourseApprovals",
                column: "ReviewedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseApprovals_AspNetUsers_SubmittedById",
                table: "CourseApprovals",
                column: "SubmittedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseApprovals_Courses_CourseId",
                table: "CourseApprovals",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseModules_Courses_CourseId",
                table: "CourseModules",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_AspNetUsers_InstructorId",
                table: "Courses",
                column: "InstructorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_AspNetUsers_StudentId",
                table: "Enrollments",
                column: "StudentId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Courses_CourseId",
                table: "Enrollments",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InstructorApprovals_AspNetUsers_UserId",
                table: "InstructorApprovals",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonProgresses_AspNetUsers_StudentId",
                table: "LessonProgresses",
                column: "StudentId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonProgresses_Lessons_LessonId",
                table: "LessonProgresses",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_CourseModules_ModuleId",
                table: "Lessons",
                column: "ModuleId",
                principalTable: "CourseModules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PasswordHistories_AspNetUsers_UserId",
                table: "PasswordHistories",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_AspNetUsers_UserId",
                table: "Payments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Courses_CourseId",
                table: "Payments",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Subscriptions_SubscriptionId",
                table: "Payments",
                column: "SubscriptionId",
                principalTable: "Subscriptions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_AspNetUsers_UserId",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AspNetUsers_StudentId",
                table: "Reviews",
                column: "StudentId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Courses_CourseId",
                table: "Reviews",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_AspNetUsers_UserId",
                table: "Subscriptions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_SubscriptionPlans_SubscriptionPlanId",
                table: "Subscriptions",
                column: "SubscriptionPlanId",
                principalTable: "SubscriptionPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
