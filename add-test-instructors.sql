-- Get distinct instructor IDs from courses
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
SELECT DISTINCT
    CAST(instructor_id AS TEXT),
    'instructor' || ROW_NUMBER() OVER (ORDER BY instructor_id) || '@example.com',
    UPPER('instructor' || ROW_NUMBER() OVER (ORDER BY instructor_id) || '@example.com'),
    'instructor' || ROW_NUMBER() OVER (ORDER BY instructor_id) || '@example.com',
    UPPER('instructor' || ROW_NUMBER() OVER (ORDER BY instructor_id) || '@example.com'),
    true,
    'AQAAAAIAAYagAAAAEP5h7v8Y0nxFNgGJmFqKwM7Y7SM7xfqYlBpZjJ8F9BgC8wABsL9Lqs6PbTYnLkH7Kw==', -- Password: Admin123
    'QWERTYUIOPASDFGHJKLZXCVBNM123456',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    false,
    false,
    NULL,
    true,
    0,
    'Instructor ' || ROW_NUMBER() OVER (ORDER BY instructor_id),
    NULL,
    'Instructor',
    'Active',
    NOW(),
    NULL,
    NULL,
    NULL,
    '{"email":true,"sms":false}'
FROM courses
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetUsers" WHERE "Id" = CAST(courses.instructor_id AS TEXT)
);

-- Add instructors to role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT DISTINCT CAST(instructor_id AS TEXT), 'Instructor'
FROM courses
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" WHERE "UserId" = CAST(courses.instructor_id AS TEXT)
);