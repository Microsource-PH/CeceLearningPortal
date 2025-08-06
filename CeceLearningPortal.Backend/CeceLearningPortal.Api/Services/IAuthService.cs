using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
        Task<bool> RevokeTokenAsync(string userId);
        Task<AuthResponseDto> ExternalLoginAsync(ExternalLoginDto externalLoginDto);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        string GenerateJwtToken(ApplicationUser user);
        RefreshToken GenerateRefreshToken(string ipAddress);
    }
}