using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CeceLearningPortal.Api.Configurations;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext context,
            JwtSettings jwtSettings,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _jwtSettings = jwtSettings;
            _logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("User already exists with this email.");
            }

            // Map Creator to Instructor role in the system
            var userRole = registerDto.Role.Equals("Creator", StringComparison.OrdinalIgnoreCase) 
                ? UserRole.Instructor 
                : UserRole.Student;

            var user = new ApplicationUser
            {
                Email = registerDto.Email,
                UserName = registerDto.Email,
                FullName = registerDto.FullName,
                Role = userRole,
                Status = UserStatus.PendingApproval, // All new registrations require admin approval
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"User creation failed: {errors}");
            }

            // Add to role
            await _userManager.AddToRoleAsync(user, user.Role.ToString());

            // For pending approval users, don't generate tokens
            if (user.Status == UserStatus.PendingApproval)
            {
                return new AuthResponseDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role.ToString(),
                    Avatar = user.Avatar,
                    Status = "PendingApproval",
                    AccessToken = string.Empty,
                    RefreshToken = string.Empty,
                    ExpiresAt = DateTime.UtcNow
                };
            }

            // Generate tokens only for approved users
            var accessToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(null);
            
            user.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Avatar = user.Avatar,
                Status = user.Status.ToString(),
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (user.Status != UserStatus.Active)
            {
                throw new UnauthorizedAccessException($"User account is {user.Status}.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;

            // Generate tokens
            var accessToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(null);
            
            // Remove old refresh tokens
            var inactiveTokens = user.RefreshTokens.Where(rt => !rt.IsActive).ToList();
            foreach (var token in inactiveTokens)
            {
                user.RefreshTokens.Remove(token);
            }
            user.RefreshTokens.Add(refreshToken);
            
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Avatar = user.Avatar,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes)
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            var principal = GetPrincipalFromExpiredToken(refreshTokenDto.AccessToken);
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid token.");
            }

            var refreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshTokenDto.RefreshToken);
            if (refreshToken == null || !refreshToken.IsActive)
            {
                throw new UnauthorizedAccessException("Invalid refresh token.");
            }

            // Replace old refresh token with a new one and save
            var newRefreshToken = GenerateRefreshToken(null);
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.ReplacedByToken = newRefreshToken.Token;
            user.RefreshTokens.Add(newRefreshToken);
            
            await _context.SaveChangesAsync();

            // Generate new JWT
            var accessToken = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Avatar = user.Avatar,
                AccessToken = accessToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes)
            };
        }

        public async Task<bool> RevokeTokenAsync(string userId)
        {
            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return false;
            }

            // Revoke all active refresh tokens
            foreach (var token in user.RefreshTokens.Where(rt => rt.IsActive))
            {
                token.RevokedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AuthResponseDto> ExternalLoginAsync(ExternalLoginDto externalLoginDto)
        {
            // This is a simplified version. In production, you would validate the token with the provider
            throw new NotImplementedException("External login not implemented yet.");
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            // Add to password history
            var passwordHistory = new PasswordHistory
            {
                UserId = userId,
                PasswordHash = user.PasswordHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.PasswordHistories.Add(passwordHistory);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal that the user doesn't exist
                return true;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // In production, send email with reset link containing the token
            _logger.LogInformation($"Password reset token generated for user {email}: {token}");
            
            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);
            return result.Succeeded;
        }

        public string GenerateJwtToken(ApplicationUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim("status", user.Status.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken(string ipAddress)
        {
            using var rngCryptoServiceProvider = new RNGCryptoServiceProvider();
            var randomBytes = new byte[64];
            rngCryptoServiceProvider.GetBytes(randomBytes);
            
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomBytes),
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays),
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.Secret)),
                ValidateLifetime = false, // We want to validate expired tokens
                ValidIssuer = _jwtSettings.Issuer,
                ValidAudience = _jwtSettings.Audience
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
            
            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }
    }
}