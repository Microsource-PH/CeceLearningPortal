@echo off
echo Setting up CeceLearningPortal database...
echo.

set PGPASSWORD=P@ssword!@

:: Common PostgreSQL installation paths
set PSQL_PATH=
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\
if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\
if exist "C:\Program Files\PostgreSQL\12\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\12\bin\

if "%PSQL_PATH%"=="" (
    echo ERROR: PostgreSQL not found in standard locations.
    echo Please install PostgreSQL or update this script with your PostgreSQL path.
    echo.
    echo You can also run these commands manually using your PostgreSQL client:
    echo 1. Connect to database: CeceLearningPortal
    echo 2. Run these SQL files in order:
    echo    - cece-learningportal-main\migrations\001_create_schema.sql
    echo    - cece-learningportal-main\migrations\002_seed_data.sql
    echo    - cece-learningportal-main\migrations\003_analytics_functions.sql
    echo    - cece-learningportal-main\migrations\004_subscription_plans_and_students.sql
    echo    - cece-learningportal-main\migrations\005_course_lessons_and_progress.sql
    echo    - cece-learningportal-main\migrations\006_course_reviews.sql
    pause
    exit /b 1
)

echo Found PostgreSQL at: %PSQL_PATH%
echo.

echo Step 1: Creating schema...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\001_create_schema.sql"

echo.
echo Step 2: Seeding data...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\002_seed_data.sql"

echo.
echo Step 3: Adding analytics functions...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\003_analytics_functions.sql"

echo.
echo Step 4: Adding subscription plans...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\004_subscription_plans_and_students.sql"

echo.
echo Step 5: Adding course lessons...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\005_course_lessons_and_progress.sql"

echo.
echo Step 6: Adding course reviews...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\006_course_reviews.sql"

echo.
echo Step 7: Checking database state...
"%PSQL_PATH%psql" -U postgres -d CeceLearningPortal -f "check-and-setup-database.sql"

echo.
echo Database setup complete!
pause