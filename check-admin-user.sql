-- Check if admin user exists
SELECT 
    "Id",
    "Email",
    "UserName",
    "PasswordHash",
    "EmailConfirmed",
    "Role",
    "Status"
FROM "AspNetUsers"
WHERE "Email" = 'admin@example.com';