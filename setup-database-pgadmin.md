# Setting up Database using pgAdmin or DBeaver

If you prefer using a GUI tool like pgAdmin or DBeaver, follow these steps:

## 1. Connect to your PostgreSQL server
- Host: localhost
- Port: 5432 (default)
- Database: CeceLearningPortal
- Username: postgres
- Password: P@ssword!@

## 2. Run the migration scripts in this order:

1. **Create Schema**
   - Open and run: `cece-learningportal-main\migrations\001_create_schema.sql`

2. **Seed Initial Data**
   - Open and run: `cece-learningportal-main\migrations\002_seed_data.sql`

3. **Add Analytics Functions**
   - Open and run: `cece-learningportal-main\migrations\003_analytics_functions.sql`

4. **Add Subscription Plans**
   - Open and run: `cece-learningportal-main\migrations\004_subscription_plans_and_students.sql`

5. **Add Course Lessons**
   - Open and run: `cece-learningportal-main\migrations\005_course_lessons_and_progress.sql`

6. **Add Course Reviews**
   - Open and run: `cece-learningportal-main\migrations\006_course_reviews.sql`

## 3. Verify the data

Run this query to check if data was loaded:
```sql
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM enrollments) as enrollments,
    (SELECT COUNT(*) FROM subscriptions) as subscriptions;
```

You should see:
- users: 7
- profiles: 7
- courses: 7+
- enrollments: several
- subscriptions: at least 1

## Test Users
All users have password: `password`
- admin@example.com (Admin)
- instructor@example.com (Creator)
- student@example.com (Learner)
- alex.chen@example.com (Learner)
- sophia.martinez@example.com (Premium Learner)