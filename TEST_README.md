# Course Creation Test Scripts

This directory contains comprehensive test scripts to verify that the Go High Level-style course creation functionality is working correctly for all course types.

## Test Scripts

### 1. `test-course-creation.js`
Basic API test that creates one course of each type (Sprint, Marathon, Membership, Custom) and verifies they are saved correctly.

### 2. `test-course-creation-detailed.js`
Advanced test with direct database verification, edge cases, and comprehensive validation.

## Prerequisites

1. **Backend API running** on `http://localhost:5295`
2. **PostgreSQL database** accessible
3. **Test creator account** (update credentials in scripts)
4. **Node.js** installed

## Setup

1. Install dependencies:
```bash
npm install axios pg
```

2. Update test credentials in both scripts:
```javascript
const TEST_INSTRUCTOR_EMAIL = 'sherwin.alegre@test.com'; // Your test creator email
const TEST_INSTRUCTOR_PASSWORD = 'Test123!'; // Your test password
```

3. For detailed tests, update database connection:
```javascript
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'cece_learning_portal',
  user: 'postgres',
  password: 'your_password' // Update this
};
```

## Running Tests

### Basic API Test
```bash
node test-course-creation.js
```

### Detailed Database Test
```bash
node test-course-creation-detailed.js
```

## Test Coverage

### Course Types Tested:
- **Sprint Course**: Short, focused courses (7-day JavaScript basics)
- **Marathon Course**: Comprehensive programs (6-month web dev bootcamp)
- **Membership**: Subscription-based access (monthly coding academy)
- **Custom Course**: Free-form courses (AI/ML for beginners)

### Features Tested:
- ✅ All pricing models (free, one-time, subscription, payment-plan)
- ✅ Access types (lifetime, limited time)
- ✅ Course features (certificates, community, live sessions, etc.)
- ✅ Drip content scheduling
- ✅ Automation settings
- ✅ Module and lesson creation
- ✅ Enrollment limits
- ✅ Multiple languages

### Edge Cases:
- Minimal required fields only
- Free courses with all features
- Subscription with drip content
- Payment plans
- Limited access courses

## Expected Output

Successful test run should show:
```
🚀 Starting Course Creation Tests...

📝 Step 1: Logging in as instructor...
✅ Login successful!

📚 Testing SPRINT Course Creation...
================================
Creating SPRINT course...
✅ SPRINT course created successfully!
   Course ID: 123
   Title: Sprint Course: JavaScript Basics in 7 Days
✅ SPRINT course verified successfully in database!

[... more course types ...]

========================================
📈 TEST SUMMARY
========================================
Total Tests: 4
✅ Passed: 4
❌ Failed: 0
Success Rate: 100.00%
```

## Database Verification

The detailed test script verifies:
1. Course record exists with correct fields
2. All modules are created with proper order
3. All lessons are linked to correct modules
4. Course type enums are properly stored
5. Pricing model is correctly saved
6. Features flags are properly set
7. Automation settings are stored

## Troubleshooting

### Common Issues:

1. **Login Failed**
   - Check credentials are correct
   - Ensure user has Creator/Instructor role
   - Verify user account is active

2. **Course Creation Failed**
   - Check API is running on correct port
   - Verify authorization header is sent
   - Check for validation errors in response

3. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database name is correct

4. **Validation Mismatches**
   - Check enum mappings (case sensitivity)
   - Verify decimal/numeric conversions
   - Check boolean field mappings

## Cleanup

To remove test courses from database:
```sql
-- Get all test courses
SELECT * FROM "Courses" 
WHERE "Title" LIKE '%Sprint Course: JavaScript%' 
   OR "Title" LIKE '%Marathon Course:%'
   OR "Title" LIKE '%Membership: Premium%'
   OR "Title" LIKE '%Custom Course:%';

-- Delete test courses (be careful!)
DELETE FROM "Courses" 
WHERE "InstructorId" = 'your-test-instructor-id' 
  AND "CreatedAt" > 'today's-date';
```

## Notes

- Tests create real courses in the database
- Each test run will create 4-9 new courses
- Consider using a test database for repeated runs
- Course IDs are logged for manual verification