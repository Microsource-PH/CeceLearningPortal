using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using CeceLearningPortal.Api.Data;

namespace CeceLearningPortal.Api.Middleware
{
    public class TokenBlacklistMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public TokenBlacklistMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = await context.GetTokenAsync("access_token") ?? 
                        context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (!string.IsNullOrEmpty(token))
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                // Check if the token's user has active refresh tokens
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(token))
                {
                    var jsonToken = handler.ReadJwtToken(token);
                    var userId = jsonToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

                    if (!string.IsNullOrEmpty(userId))
                    {
                        var hasActiveTokens = await dbContext.RefreshTokens
                            .AnyAsync(rt => rt.UserId == userId && rt.RevokedAt == null && DateTime.UtcNow < rt.ExpiresAt);

                        if (!hasActiveTokens)
                        {
                            context.Response.StatusCode = 401;
                            await context.Response.WriteAsync("Token has been revoked");
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }

    public static class TokenBlacklistMiddlewareExtensions
    {
        public static IApplicationBuilder UseTokenBlacklist(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TokenBlacklistMiddleware>();
        }
    }
}