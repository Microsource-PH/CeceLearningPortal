-- Update the NotificationPreferences field to be a JSON array instead of object
UPDATE "AspNetUsers" 
SET "NotificationPreferences" = '["email"]'
WHERE "NotificationPreferences" = '{"email":true,"sms":false}';

-- Also update the default value for future inserts
ALTER TABLE "AspNetUsers" 
ALTER COLUMN "NotificationPreferences" SET DEFAULT '[]';