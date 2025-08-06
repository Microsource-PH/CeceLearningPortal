# Demo Credentials - Cece Learning Portal

## Working User Accounts

### 1. Admin Account
- **Email:** admin@example.com
- **Password:** Admin123
- **Role:** Admin
- **Access:** Full platform access, analytics, user management

### 2. Instructor/Creator Account (Dr. Sarah Johnson)
- **Email:** instructor@example.com
- **Password:** Instructor123
- **Name:** Dr. Sarah Johnson
- **Role:** Creator/Instructor
- **Access:** Creator Hub, course management, earnings, analytics

### 3. Student/Learner Account
- **Email:** student@example.com
- **Password:** Student123
- **Name:** Jane Doe
- **Role:** Learner
- **Access:** Course enrollment, learning dashboard, progress tracking

### 4. Alternative Instructor Account (if needed)
- **Email:** sarah.johnson@example.com
- **Password:** Creator123!
- **Name:** Dr. Sarah Johnson
- **Role:** Creator
- **Note:** This account may need approval from admin

## API Endpoints

### Backend API
- **URL:** http://localhost:5295
- **Swagger:** http://localhost:5295/swagger

### Frontend Application
- **URL:** http://localhost:8080
- **Framework:** React + Vite + TypeScript

## Quick Access Links

1. **Marketplace:** http://localhost:8080/marketplace
2. **Creator Hub:** http://localhost:8080/marketplace (login as instructor)
3. **Admin Dashboard:** http://localhost:8080/marketplace (login as admin)
4. **Courses:** http://localhost:8080/courses

## Features by Role

### Admin Features
- Platform Analytics tab
- View all instructors and their earnings
- Platform revenue breakdown (80/20 split)
- User statistics
- Category performance
- Subscription metrics

### Instructor/Creator Features
- My Courses tab (shows only their courses)
- Course creation and management
- Earnings Report with time filters (All Time, This Year, This Month)
- Course analytics and performance
- Student engagement metrics
- Revenue tracking (80% creator share)

### Student/Learner Features
- Browse all courses
- Enroll in courses
- Track learning progress
- View completed courses
- Access certificates
- Subscription plans

## Test Data

### Dr. Sarah Johnson's Courses
When logged in as instructor@example.com, you'll see courses including:
- Advanced Machine Learning Techniques
- Data Science Fundamentals
- Python for Data Analysis
- Deep Learning with TensorFlow
- Statistical Analysis with R

### Revenue Data
- Courses have varying student counts and prices
- Revenue is calculated as: Students × Price
- Creator receives 80% of revenue
- Platform receives 20% of revenue
- All monetary values display with 2 decimal places (₱X,XXX.XX)

## Troubleshooting

### If login fails:
1. Check if backend is running on port 5295
2. Check if frontend is running on port 8080
3. Clear browser localStorage and cookies
4. Try using incognito/private browsing mode

### To seed data:
1. Login as admin
2. Go to Marketplace
3. Look for "Seed Sarah Johnson Data" button (admin only)
4. Click to populate demo data

### To verify course filtering:
1. Login as instructor@example.com
2. Go to Marketplace → My Courses (should only show Dr. Sarah Johnson's courses)
3. Go to Browse Courses (should show all courses)
4. Go to Instructors tab (should show all instructors grouped with their courses)

## Database Reset

If you need to reset the database:
```bash
# Navigate to backend directory
cd CeceLearningPortal.Backend/CeceLearningPortal.Api

# Drop and recreate database
dotnet ef database drop
dotnet ef database update

# Run the application (seeds initial data)
dotnet run
```

## Notes
- All passwords are for demo purposes only
- The backend uses JWT authentication
- Instructor accounts may need admin approval after registration
- Mock data is generated for demo purposes when real data is not available