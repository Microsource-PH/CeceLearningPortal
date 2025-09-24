@echo off
echo Setting up CeceLearningPortal database...
echo.

set PGPASSWORD=P@ssword!@

echo Step 1: Creating schema...
psql -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\001_create_schema.sql"

echo.
echo Step 2: Seeding data...
psql -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\002_seed_data.sql"

echo.
echo Step 3: Adding analytics functions...
psql -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\003_analytics_functions.sql"

echo.
echo Step 4: Adding subscription plans...
psql -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\004_subscription_plans_and_students.sql"

echo.
echo Step 5: Adding course lessons...
psql -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\005_course_lessons_and_progress.sql"

echo.
echo Step 6: Adding course reviews...
psql -U postgres -d CeceLearningPortal -f "cece-learningportal-main\migrations\006_course_reviews.sql"

echo.
echo Step 7: Checking database state...
psql -U postgres -d CeceLearningPortal -f "check-and-setup-database.sql"

echo.
echo Database setup complete!
pause