-- Delete existing admin user if exists
DELETE FROM "AspNetUserRoles" WHERE "UserId" = '1';
DELETE FROM "AspNetUsers" WHERE "Id" = '1';

-- Insert fresh admin user with proper password hash for Admin123!
INSERT INTO "AspNetUsers" (
    "Id", 
    "UserName", 
    "NormalizedUserName", 
    "Email", 
    "NormalizedEmail", 
    "EmailConfirmed", 
    "PasswordHash", 
    "SecurityStamp", 
    "ConcurrencyStamp", 
    "PhoneNumber", 
    "PhoneNumberConfirmed", 
    "TwoFactorEnabled", 
    "LockoutEnd", 
    "LockoutEnabled", 
    "AccessFailedCount", 
    "FullName", 
    "Avatar", 
    "Role", 
    "Status", 
    "CreatedAt", 
    "LastLoginAt", 
    "RefreshToken", 
    "RefreshTokenExpiryTime", 
    "NotificationPreferences"
)
VALUES (
    '1',
    'admin@example.com',
    'ADMIN@EXAMPLE.COM',
    'admin@example.com',
    'ADMIN@EXAMPLE.COM',
    true,
    'AQAAAAIAAYagAAAAEBJVIqIqzGwMkf+tqjHvPtHU7RHXd3p7tKLhZxJ0VPGa8Z8xaVKHPvXkVlyJ8OgCJA==', -- Password: Admin123!
    'QWERTYUIOPASDFGHJKLZXCVBNM123456',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    false,
    false,
    NULL,
    true,
    0,
    'Admin User',
    NULL,
    'Admin',
    'Active',
    NOW(),
    NULL,
    NULL,
    NULL,
    '["email"]'
);

-- Add admin to Admin role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
VALUES ('1', '1');