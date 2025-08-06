-- Check if AspNetUsers table exists and has data
SELECT COUNT(*) as user_count FROM "AspNetUsers";

-- Check for admin user specifically
SELECT "Id", "Email", "UserName", "Role", "Status" 
FROM "AspNetUsers" 
WHERE "Email" = 'admin@cece.com';

-- List all users
SELECT "Id", "Email", "UserName", "Role", "Status" 
FROM "AspNetUsers" 
LIMIT 10;