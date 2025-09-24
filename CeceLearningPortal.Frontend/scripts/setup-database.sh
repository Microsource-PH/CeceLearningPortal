#!/bin/bash

# PostgreSQL database setup script
set -e

# Database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="CeceLearningPortal"
DB_USER="postgres"
DB_PASSWORD="P@ssword!@"

echo "Setting up PostgreSQL database..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL client (psql) not found. Please install PostgreSQL first."
    exit 1
fi

# Create database if it doesn't exist
echo "Creating database $DB_NAME..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE \"$DB_NAME\""

# Run migrations
echo "Running migrations..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_create_schema.sql

# Run seed data
echo "Loading seed data..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/002_seed_data.sql

echo "Database setup complete!"
echo ""
echo "Database connection string:"
echo "Host=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD"
echo ""
echo "You can now start the application with:"
echo "npm run dev:full"