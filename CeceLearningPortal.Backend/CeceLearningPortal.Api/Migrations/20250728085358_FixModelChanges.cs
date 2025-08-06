using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CeceLearningPortal.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AverageQuizScore",
                table: "Enrollments",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CertificateIssued",
                table: "Enrollments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CompletedLessons",
                table: "Enrollments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAccessedDate",
                table: "Enrollments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuizCount",
                table: "Enrollments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalTimeSpent",
                table: "Enrollments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AverageQuizScore",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "CertificateIssued",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "CompletedLessons",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "LastAccessedDate",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "QuizCount",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "TotalTimeSpent",
                table: "Enrollments");
        }
    }
}
