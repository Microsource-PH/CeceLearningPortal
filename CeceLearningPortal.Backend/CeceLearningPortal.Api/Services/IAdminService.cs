using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public interface IAdminService
    {
        // User Management
        Task<IEnumerable<UserManagementDto>> GetUsersAsync(UserManagementFilterDto filter);
        Task<UserManagementDto> GetUserByIdAsync(string userId);
        Task<UserManagementStatsDto> GetUserManagementStatsAsync();
        
        // User Approval
        Task<bool> ApproveUserAsync(ApproveUserDto approveDto, string adminId);
        Task<bool> UpdateUserStatusAsync(UpdateUserStatusDto statusDto, string adminId);
        
        // Admin Creation
        Task<UserManagementDto> CreateAdminAsync(CreateAdminDto createDto);
        
        // Instructor Approval
        Task<IEnumerable<InstructorApprovalDto>> GetPendingInstructorApprovalsAsync();
        Task<bool> ReviewInstructorApprovalAsync(int approvalId, ReviewInstructorApprovalDto reviewDto, string adminId);
        
        // Notifications
        Task SendApprovalNotificationAsync(string userId, bool approved, string reason = null);
        Task SendStatusChangeNotificationAsync(string userId, UserStatus newStatus, string reason = null);
        
        // New methods for enhanced admin functionality
        Task<bool> UpdateUserRoleAsync(string userId, string role);
        Task<object> GetUserSubscriptionAsync(string userId);
        Task<bool> UpdateUserSubscriptionAsync(string userId, string planId, bool isBilledYearly = false);
        Task<CourseDto> CreateCourseAsync(CreateCourseDto dto, string adminId);
        Task<CourseDto> UpdateCourseAsync(int courseId, UpdateCourseDto dto);
        Task<bool> DeleteCourseAsync(int courseId);
        Task<bool> ApproveCourseAsync(int courseId, string adminId);
        Task<bool> RejectCourseAsync(int courseId, string reason, string adminId);
    }
}