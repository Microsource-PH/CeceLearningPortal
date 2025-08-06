using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CeceLearningPortal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGoHighLevelCourseFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Duration",
                table: "Courses",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "AccessDuration",
                table: "Courses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AccessType",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationAbandonmentSequence",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationCompletionCertificate",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationProgressReminders",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationWelcomeEmail",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CourseType",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Courses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "DripContent",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "DripScheduleJson",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EnrollmentLimit",
                table: "Courses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasAssignments",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasCertificate",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasCommunity",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasDownloadableResources",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasLiveSessions",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasQuizzes",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Courses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentPlanDetailsJson",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PricingModel",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PromoVideoUrl",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "Courses",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortDescription",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionPeriod",
                table: "Courses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CourseApprovals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    SubmittedById = table.Column<string>(type: "text", nullable: false),
                    ReviewedById = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Feedback = table.Column<string>(type: "text", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseApprovals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseApprovals_AspNetUsers_ReviewedById",
                        column: x => x.ReviewedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CourseApprovals_AspNetUsers_SubmittedById",
                        column: x => x.SubmittedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CourseApprovals_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseApprovals_CourseId",
                table: "CourseApprovals",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseApprovals_ReviewedById",
                table: "CourseApprovals",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_CourseApprovals_SubmittedById",
                table: "CourseApprovals",
                column: "SubmittedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseApprovals");

            migrationBuilder.DropColumn(
                name: "AccessDuration",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "AccessType",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "AutomationAbandonmentSequence",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "AutomationCompletionCertificate",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "AutomationProgressReminders",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "AutomationWelcomeEmail",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "CourseType",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "DripContent",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "DripScheduleJson",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "EnrollmentLimit",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HasAssignments",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HasCertificate",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HasCommunity",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HasDownloadableResources",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HasLiveSessions",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HasQuizzes",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PaymentPlanDetailsJson",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PricingModel",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PromoVideoUrl",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ShortDescription",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "SubscriptionPeriod",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "Courses");

            migrationBuilder.AlterColumn<string>(
                name: "Duration",
                table: "Courses",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
