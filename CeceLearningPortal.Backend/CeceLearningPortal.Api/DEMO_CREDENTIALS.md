# Demo Credentials

## Updated Demo Login Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `Admin123`
- **Role**: Admin
- **Full Name**: Admin User

### Instructor Account
- **Email**: `instructor@example.com`
- **Password**: `Instructor123`
- **Role**: Instructor
- **Full Name**: Dr. Sarah Johnson

### Student Account
- **Email**: `student@example.com`
- **Password**: `Student123`
- **Role**: Student
- **Full Name**: Jane Doe

## Additional Test Users (Created via seeding)

### Direct Purchase Student
- **Email**: `alex.smith@example.com`
- **Password**: `Password123`
- **Full Name**: Alex Smith
- **Enrollment**: Bought "Computer Vision Fundamentals" directly ($199.99)

### Premium Subscriber Student
- **Email**: `sarah.wilson@example.com`
- **Password**: `Password123`
- **Full Name**: Sarah Wilson
- **Subscription**: Premium Plan ($49.99/month)
- **Enrollment**: Enrolled in "Computer Vision Fundamentals" via subscription

## Revenue Test Endpoints

### Get Instructor Revenue
```
GET /api/revenue/instructor/{instructorId}
```

Example for Dr. Sarah Johnson:
```
GET /api/revenue/instructor/9a460b27-0204-4b6e-a1f4-79ef838d0b5f
```

Expected Result:
- Total Revenue: ~$233.32
- Direct Sales: $199.99 (Alex Smith)
- Subscription Revenue: ~$33.33 (Sarah Wilson's Premium plan share)

### Get Course Subscription Revenue
```
GET /api/revenue/course/5
```

Expected Result:
- Course ID: 5 (Computer Vision Fundamentals)
- Subscription Revenue: ~$33.33

## Notes
- All passwords have been updated to use proper ASP.NET Identity hashing
- Authentication now works correctly for all demo accounts
- Revenue calculation system is fully functional and tested