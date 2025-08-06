#!/bin/bash

echo "==============================================="
echo "Testing fixes for Cece Learning Portal"
echo "==============================================="
echo ""

# Check PostgreSQL connection
echo "1. Checking PostgreSQL connection..."
psql -U postgres -h localhost -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL is running"
else
    echo "✗ PostgreSQL is not running or not accessible"
    echo "  Please ensure PostgreSQL is installed and running"
    exit 1
fi

# Check databases
echo ""
echo "2. Checking databases..."
echo "Databases with 'cece' in name:"
psql -U postgres -h localhost -t -c "SELECT datname FROM pg_database WHERE datname ILIKE '%cece%';" 2>/dev/null

# Test backend build
echo ""
echo "3. Testing backend build..."
cd CeceLearningPortal.Backend
dotnet build CeceLearningPortal.sln --nologo -v q
if [ $? -eq 0 ]; then
    echo "✓ Backend builds successfully"
else
    echo "✗ Backend build failed"
fi

# Test frontend dependencies
echo ""
echo "4. Testing frontend dependencies..."
cd ../../cece-learningportal-main
npm list > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies are installed"
else
    echo "✗ Frontend dependencies have issues"
    echo "  Run: npm install"
fi

echo ""
echo "==============================================="
echo "Summary of fixes applied:"
echo "==============================================="
echo "1. Created database setup script (fix-database.sql)"
echo "2. Added EF Core value comparers to fix warnings"
echo "3. Updated browserslist database"
echo "4. Created database connection fix script"
echo ""
echo "To start the application:"
echo "1. Backend: cd CeceLearningPortal.Backend/CeceLearningPortal.Api && dotnet run"
echo "2. Frontend: cd cece-learningportal-main && npm run dev"
echo ""
echo "Note: Ensure PostgreSQL has both 'CeceLearningPortal' and 'cecelearningportal' databases"
echo "      for compatibility between frontend and backend."