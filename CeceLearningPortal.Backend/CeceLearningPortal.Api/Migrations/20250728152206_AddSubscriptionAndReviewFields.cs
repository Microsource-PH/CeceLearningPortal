using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CeceLearningPortal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionAndReviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasAnalytics",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasPrioritySupport",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRecommended",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxCoursesCanCreate",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxStudentsPerCourse",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlanType",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TransactionFeePercentage",
                table: "SubscriptionPlans",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFlagged",
                table: "Reviews",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "HasAnalytics",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "HasPrioritySupport",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "IsRecommended",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "MaxCoursesCanCreate",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "MaxStudentsPerCourse",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "PlanType",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "TransactionFeePercentage",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "IsFlagged",
                table: "Reviews");
        }
    }
}
