-- This script ensures the database exists with the correct name
-- Run this with: psql -U postgres -f fix-database.sql

-- Check if database exists (case-insensitive)
SELECT datname FROM pg_database WHERE lower(datname) = 'cecelearningportal';

-- Create database if it doesn't exist
-- Note: PostgreSQL will lowercase the name unless quoted
CREATE DATABASE "CeceLearningPortal";

-- Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE "CeceLearningPortal" TO postgres;

-- Display all databases to confirm
\l