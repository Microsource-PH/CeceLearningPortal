-- Create views to map snake_case table names to ASP.NET Identity expected names
DROP VIEW IF EXISTS asp_net_users CASCADE;
DROP VIEW IF EXISTS asp_net_roles CASCADE;
DROP VIEW IF EXISTS asp_net_user_roles CASCADE;
DROP VIEW IF EXISTS asp_net_user_claims CASCADE;
DROP VIEW IF EXISTS asp_net_role_claims CASCADE;
DROP VIEW IF EXISTS asp_net_user_logins CASCADE;
DROP VIEW IF EXISTS asp_net_user_tokens CASCADE;

-- Map AspNetUsers to asp_net_users
CREATE VIEW asp_net_users AS 
SELECT 
    "Id" as id,
    "UserName" as user_name,
    "NormalizedUserName" as normalized_user_name,
    "Email" as email,
    "NormalizedEmail" as normalized_email,
    "EmailConfirmed" as email_confirmed,
    "PasswordHash" as password_hash,
    "SecurityStamp" as security_stamp,
    "ConcurrencyStamp" as concurrency_stamp,
    "PhoneNumber" as phone_number,
    "PhoneNumberConfirmed" as phone_number_confirmed,
    "TwoFactorEnabled" as two_factor_enabled,
    "LockoutEnd" as lockout_end,
    "LockoutEnabled" as lockout_enabled,
    "AccessFailedCount" as access_failed_count,
    "FullName" as full_name,
    "Avatar" as avatar,
    "Role" as role,
    "Status" as status,
    "CreatedAt" as created_at,
    "LastLoginAt" as last_login_at,
    "RefreshToken" as refresh_token,
    "RefreshTokenExpiryTime" as refresh_token_expiry_time,
    "NotificationPreferences" as notification_preferences
FROM "AspNetUsers";

-- Map AspNetRoles to asp_net_roles
CREATE VIEW asp_net_roles AS 
SELECT 
    "Id" as id,
    "Name" as name,
    "NormalizedName" as normalized_name,
    "ConcurrencyStamp" as concurrency_stamp
FROM "AspNetRoles";

-- Map AspNetUserRoles to asp_net_user_roles
CREATE VIEW asp_net_user_roles AS 
SELECT 
    "UserId" as user_id,
    "RoleId" as role_id
FROM "AspNetUserRoles";

-- Map AspNetUserClaims to asp_net_user_claims
CREATE VIEW asp_net_user_claims AS 
SELECT 
    "Id" as id,
    "UserId" as user_id,
    "ClaimType" as claim_type,
    "ClaimValue" as claim_value
FROM "AspNetUserClaims";

-- Map AspNetRoleClaims to asp_net_role_claims
CREATE VIEW asp_net_role_claims AS 
SELECT 
    "Id" as id,
    "RoleId" as role_id,
    "ClaimType" as claim_type,
    "ClaimValue" as claim_value
FROM "AspNetRoleClaims";

-- Map AspNetUserLogins to asp_net_user_logins
CREATE VIEW asp_net_user_logins AS 
SELECT 
    "LoginProvider" as login_provider,
    "ProviderKey" as provider_key,
    "ProviderDisplayName" as provider_display_name,
    "UserId" as user_id
FROM "AspNetUserLogins";

-- Map AspNetUserTokens to asp_net_user_tokens
CREATE VIEW asp_net_user_tokens AS 
SELECT 
    "UserId" as user_id,
    "LoginProvider" as login_provider,
    "Name" as name,
    "Value" as value
FROM "AspNetUserTokens";