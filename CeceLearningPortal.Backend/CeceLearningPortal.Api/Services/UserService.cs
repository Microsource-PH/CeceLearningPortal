using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<UserDto> GetUserByIdAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Avatar = user.Avatar,
                Status = user.Status.ToString(),
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync(UserFilterDto filter)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(filter.Role))
                query = query.Where(u => u.Role == Enum.Parse<UserRole>(filter.Role));

            if (!string.IsNullOrEmpty(filter.Status))
                query = query.Where(u => u.Status == Enum.Parse<UserStatus>(filter.Status));

            if (!string.IsNullOrEmpty(filter.SearchTerm))
                query = query.Where(u => u.FullName.Contains(filter.SearchTerm) || u.Email.Contains(filter.SearchTerm));

            if (filter.CreatedAfter.HasValue)
                query = query.Where(u => u.CreatedAt >= filter.CreatedAfter.Value);

            if (filter.CreatedBefore.HasValue)
                query = query.Where(u => u.CreatedAt <= filter.CreatedBefore.Value);

            var users = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role.ToString(),
                    Avatar = u.Avatar,
                    Status = u.Status.ToString(),
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return users;
        }

        public async Task<UserDto> UpdateUserAsync(string userId, UpdateUserDto updateDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            if (!string.IsNullOrEmpty(updateDto.FullName))
                user.FullName = updateDto.FullName;

            if (updateDto.Avatar != null)
                user.Avatar = updateDto.Avatar;

            if (updateDto.NotificationPreferences != null)
                user.NotificationPreferences = updateDto.NotificationPreferences;

            await _context.SaveChangesAsync();
            return await GetUserByIdAsync(userId);
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeUserStatusAsync(string userId, string status)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Status = Enum.Parse<UserStatus>(status);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeUserRoleAsync(string userId, string role)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Role = Enum.Parse<UserRole>(role);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<InstructorApprovalDto> GetInstructorApprovalAsync(string userId)
        {
            var approval = await _context.InstructorApprovals
                .Include(ia => ia.User)
                .FirstOrDefaultAsync(ia => ia.UserId == userId);

            if (approval == null) return null;

            return new InstructorApprovalDto
            {
                Id = approval.Id,
                UserId = approval.UserId,
                UserName = approval.User.FullName,
                UserEmail = approval.User.Email,
                Bio = approval.Bio,
                Qualifications = approval.Qualifications,
                TeachingExperience = approval.TeachingExperience,
                LinkedInProfile = approval.LinkedInProfile,
                WebsiteUrl = approval.WebsiteUrl,
                Status = approval.Status.ToString(),
                ReviewerNotes = approval.ReviewerNotes,
                SubmittedAt = approval.SubmittedAt,
                ReviewedAt = approval.ReviewedAt,
                ReviewedBy = approval.ReviewedBy
            };
        }

        public async Task<InstructorApprovalDto> SubmitInstructorApprovalAsync(string userId, SubmitInstructorApprovalDto approvalDto)
        {
            var approval = new InstructorApproval
            {
                UserId = userId,
                Bio = approvalDto.Bio,
                Qualifications = approvalDto.Qualifications,
                TeachingExperience = approvalDto.TeachingExperience,
                LinkedInProfile = approvalDto.LinkedInProfile,
                WebsiteUrl = approvalDto.WebsiteUrl,
                Status = ApprovalStatus.Pending,
                SubmittedAt = DateTime.UtcNow
            };

            _context.InstructorApprovals.Add(approval);
            await _context.SaveChangesAsync();

            return await GetInstructorApprovalAsync(userId);
        }

        public async Task<bool> ReviewInstructorApprovalAsync(int approvalId, ReviewInstructorApprovalDto reviewDto, string reviewerId)
        {
            var approval = await _context.InstructorApprovals
                .Include(ia => ia.User)
                .FirstOrDefaultAsync(ia => ia.Id == approvalId);

            if (approval == null) return false;

            approval.Status = Enum.Parse<ApprovalStatus>(reviewDto.Status);
            approval.ReviewerNotes = reviewDto.ReviewerNotes;
            approval.ReviewedAt = DateTime.UtcNow;
            approval.ReviewedBy = reviewerId;

            if (approval.Status == ApprovalStatus.Approved)
            {
                approval.User.Role = UserRole.Instructor;
                approval.User.Status = UserStatus.Active;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UserStatsDto> GetUserStatsAsync(string userId)
        {
            var user = await _context.Users
                .Include(u => u.InstructedCourses)
                .ThenInclude(c => c.Enrollments)
                .Include(u => u.InstructedCourses)
                .ThenInclude(c => c.Reviews)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            var stats = new UserStatsDto
            {
                TotalCourses = user.InstructedCourses.Count,
                ActiveCourses = user.InstructedCourses.Count(c => c.Status == CourseStatus.Active),
                TotalStudents = user.InstructedCourses.Sum(c => c.Enrollments.Count),
                TotalRevenue = user.InstructedCourses.Sum(c => c.Enrollments.Count * c.Price),
                TotalReviews = user.InstructedCourses.Sum(c => c.Reviews.Count),
                AverageRating = user.InstructedCourses.Any(c => c.Reviews.Any()) 
                    ? user.InstructedCourses.Where(c => c.Reviews.Any()).Average(c => c.Reviews.Average(r => r.Rating))
                    : 0,
                StudentsByMonth = new Dictionary<string, int>(),
                RevenueByMonth = new Dictionary<string, decimal>()
            };

            return stats;
        }
    }
}