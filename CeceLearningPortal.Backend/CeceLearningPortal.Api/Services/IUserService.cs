using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Services
{
    public interface IUserService
    {
        Task<UserDto> GetUserByIdAsync(string userId);
        Task<IEnumerable<UserDto>> GetAllUsersAsync(UserFilterDto filter);
        Task<UserDto> UpdateUserAsync(string userId, UpdateUserDto updateDto);
        Task<bool> DeleteUserAsync(string userId);
        Task<bool> ChangeUserStatusAsync(string userId, string status);
        Task<bool> ChangeUserRoleAsync(string userId, string role);
        Task<InstructorApprovalDto> GetInstructorApprovalAsync(string userId);
        Task<InstructorApprovalDto> SubmitInstructorApprovalAsync(string userId, SubmitInstructorApprovalDto approvalDto);
        Task<bool> ReviewInstructorApprovalAsync(int approvalId, ReviewInstructorApprovalDto reviewDto, string reviewerId);
        Task<UserStatsDto> GetUserStatsAsync(string userId);
    }
}