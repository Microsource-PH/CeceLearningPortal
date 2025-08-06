-- Create ASP.NET Identity tables
CREATE TABLE IF NOT EXISTS "AspNetRoles" (
    "Id" text NOT NULL,
    "Name" character varying(256),
    "NormalizedName" character varying(256),
    "ConcurrencyStamp" text,
    CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "AspNetUsers" (
    "Id" text NOT NULL,
    "UserName" character varying(256),
    "NormalizedUserName" character varying(256),
    "Email" character varying(256),
    "NormalizedEmail" character varying(256),
    "EmailConfirmed" boolean NOT NULL,
    "PasswordHash" text,
    "SecurityStamp" text,
    "ConcurrencyStamp" text,
    "PhoneNumber" text,
    "PhoneNumberConfirmed" boolean NOT NULL,
    "TwoFactorEnabled" boolean NOT NULL,
    "LockoutEnd" timestamp with time zone,
    "LockoutEnabled" boolean NOT NULL,
    "AccessFailedCount" integer NOT NULL,
    "FullName" text NOT NULL,
    "Avatar" text,
    "Role" text NOT NULL,
    "Status" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "LastLoginAt" timestamp with time zone,
    "RefreshToken" text,
    "RefreshTokenExpiryTime" timestamp with time zone,
    "NotificationPreferences" text NOT NULL DEFAULT '{}',
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "AspNetUserRoles" (
    "UserId" text NOT NULL,
    "RoleId" text NOT NULL,
    CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId")
);

CREATE TABLE IF NOT EXISTS "AspNetUserClaims" (
    "Id" serial NOT NULL,
    "UserId" text NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "AspNetUserLogins" (
    "LoginProvider" text NOT NULL,
    "ProviderKey" text NOT NULL,
    "ProviderDisplayName" text,
    "UserId" text NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey")
);

CREATE TABLE IF NOT EXISTS "AspNetUserTokens" (
    "UserId" text NOT NULL,
    "LoginProvider" text NOT NULL,
    "Name" text NOT NULL,
    "Value" text,
    CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name")
);

CREATE TABLE IF NOT EXISTS "AspNetRoleClaims" (
    "Id" serial NOT NULL,
    "RoleId" text NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
CREATE UNIQUE INDEX IF NOT EXISTS "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");
CREATE INDEX IF NOT EXISTS "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");
CREATE INDEX IF NOT EXISTS "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
CREATE INDEX IF NOT EXISTS "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");

-- Insert default roles
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
    ('Admin', 'Admin', 'ADMIN', ''),
    ('Instructor', 'Instructor', 'INSTRUCTOR', ''),
    ('Student', 'Student', 'STUDENT', '')
ON CONFLICT ("Id") DO NOTHING;

-- Insert admin user
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
    'AQAAAAIAAYagAAAAEP5h7v8Y0nxFNgGJmFqKwM7Y7SM7xfqYlBpZjJ8F9BgC8wABsL9Lqs6PbTYnLkH7Kw==', -- Password: Admin123
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
    '{"email":true,"sms":false}'
)
ON CONFLICT ("Id") DO NOTHING;

-- Add admin to role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
VALUES ('1', 'Admin')
ON CONFLICT DO NOTHING;