#!/bin/bash

echo "Fixing database connection issues..."

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
pg_isready -h localhost -p 5432

# Create database with correct name (case-sensitive)
echo "Creating database if it doesn't exist..."
psql -U postgres -h localhost -c "CREATE DATABASE \"CeceLearningPortal\";" 2>/dev/null || echo "Database already exists or error occurred"

# Also create lowercase version for compatibility
psql -U postgres -h localhost -c "CREATE DATABASE cecelearningportal;" 2>/dev/null || echo "Lowercase database already exists or error occurred"

# List databases to confirm
echo "Current databases:"
psql -U postgres -h localhost -c "\l" | grep -i cece

echo "Database setup complete!"
echo ""
echo "To run the backend:"
echo "cd CeceLearningPortal.Backend/CeceLearningPortal.Api"
echo "dotnet run"
echo ""
echo "To run the frontend:"
echo "cd cece-learningportal-main"
echo "npm run dev"