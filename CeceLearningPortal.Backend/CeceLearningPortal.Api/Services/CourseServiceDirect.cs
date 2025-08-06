using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using System.Data;
using Npgsql;

namespace CeceLearningPortal.Api.Services
{
    public class CourseServiceDirect
    {
        private readonly string _connectionString;
        private readonly ILogger<CourseServiceDirect> _logger;

        public CourseServiceDirect(IConfiguration configuration, ILogger<CourseServiceDirect> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        public async Task<bool> UpdateCourseDirect(int courseId, UpdateCourseDto dto)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // First, let's update only the basic fields that we know exist
                var sql = @"
                    UPDATE courses 
                    SET title = @title,
                        description = @description,
                        price = @price,
                        duration = @duration,
                        level = @level,
                        category = @category,
                        updated_at = @updatedAt
                    WHERE id = @id";

                using var command = new NpgsqlCommand(sql, connection);
                
                // Add parameters with explicit types - only basic fields for now
                command.Parameters.AddWithValue("@id", courseId);
                command.Parameters.AddWithValue("@title", dto.Title ?? "");
                command.Parameters.AddWithValue("@description", dto.Description ?? "");
                command.Parameters.AddWithValue("@price", dto.Price ?? 0m);
                command.Parameters.AddWithValue("@duration", dto.Duration ?? "");
                command.Parameters.AddWithValue("@level", dto.Level != null ? ParseLevel(dto.Level) : 0);
                command.Parameters.AddWithValue("@category", dto.Category ?? "");
                command.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                
                _logger.LogInformation($"Direct SQL update affected {rowsAffected} rows for course {courseId}");
                
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in direct course update for course {courseId}");
                throw;
            }
        }

        private int ParseLevel(string level)
        {
            return level switch
            {
                "Beginner" => 0,
                "Intermediate" => 1,
                "Advanced" => 2,
                "AllLevels" => 3,
                _ => 0
            };
        }

        private int ParseCourseType(string type)
        {
            return type switch
            {
                "Sprint" => 0,
                "Marathon" => 1,
                "Membership" => 2,
                "Custom" => 3,
                _ => 3
            };
        }

        private int ParsePricingModel(string model)
        {
            return model switch
            {
                "Free" => 0,
                "OneTime" => 1,
                "Subscription" => 2,
                "PaymentPlan" => 3,
                _ => 1
            };
        }

        private int ParseAccessType(string type)
        {
            return type switch
            {
                "Lifetime" => 0,
                "Limited" => 1,
                _ => 0
            };
        }
    }
}