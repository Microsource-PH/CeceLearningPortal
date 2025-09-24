# PostgreSQL Setup Guide for CeceLearningPortal

This guide explains how to set up the CeceLearningPortal with a PostgreSQL database as configured in `appsettings.json`.

## Prerequisites

1. PostgreSQL 12+ installed and running
2. Node.js 16+ and npm installed
3. PostgreSQL client tools (psql)

## Quick Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure your database connection:**
The connection string is configured in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "CeceLearningPortal": "Host=localhost;Port=5432;Database=CeceLearningPortal;Username=postgres;Password=postgres"
  }
}
```
Update the connection string with your PostgreSQL credentials.

3. **Create a `.env` file:**
```bash
cp .env.example .env
```
Make sure `VITE_USE_POSTGRES=true` is set.

4. **Run the database setup:**
```bash
npm run db:setup
```

This will:
- Create the CeceLearningPortal database
- Create all required tables
- Seed initial data including users and courses

5. **Start the application:**
```bash
npm run dev
```

## Manual Database Setup

If you prefer to set up the database manually:

1. **Create the database:**
```sql
CREATE DATABASE "CeceLearningPortal";
```

2. **Run the schema migration:**
```bash
psql -h localhost -U postgres -d CeceLearningPortal -f migrations/001_create_schema.sql
```

3. **Seed the data:**
```bash
psql -h localhost -U postgres -d CeceLearningPortal -f migrations/002_seed_data.sql
```

## Test Accounts

All test accounts use the password: **password**

| Role | Email | Name | Description |
|------|-------|------|-------------|
| Admin | admin@example.com | Michael Chen | Platform administrator |
| Creator | instructor@example.com | Dr. Sarah Johnson | Course creator with 5 courses |
| Learner | student@example.com | John Smith | Student with enrollments |
| Learner | alex.chen@example.com | Alex Chen | Direct purchase student |
| Learner | sophia.martinez@example.com | Sophia Martinez | Premium subscriber |

## Database Schema

The database includes the following main tables:

### Core Tables
- **users** - Authentication and login
- **profiles** - User profile information
- **courses** - Course catalog
- **enrollments** - Student course enrollments
- **transactions** - Payment history
- **subscriptions** - Active subscriptions

### Stats Tables
- **user_stats** - Learning statistics
- **instructor_stats** - Creator performance metrics

### Supporting Tables
- **sessions** - Active user sessions
- **activities** - User activity log
- **certificates** - Earned certificates

## Features

1. **Direct PostgreSQL Connection**
   - No external services required
   - Connection string from `appsettings.json`
   - Full control over your data

2. **Secure Authentication**
   - Bcrypt password hashing
   - Session-based authentication
   - Role-based access control

3. **Real Data Management**
   - All data stored in PostgreSQL
   - Automatic statistics calculation
   - Transaction support

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Ensure PostgreSQL is running: `pg_isready`
2. Check your connection string in `appsettings.json`
3. Verify the database exists: `psql -U postgres -l`

### Permission Issues

If you get permission errors:
```bash
# Grant all privileges to your user
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"CeceLearningPortal\" TO postgres;"
```

### Reset Database

To completely reset and reseed:
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS \"CeceLearningPortal\";"
npm run db:setup
```

## Development

### Adding New Tables

1. Create a new migration file in `migrations/`
2. Add your SQL DDL statements
3. Run the migration: `psql -U postgres -d CeceLearningPortal -f migrations/your_migration.sql`

### Accessing the Database

You can use any PostgreSQL client:
- **psql**: `psql -U postgres -d CeceLearningPortal`
- **pgAdmin**: Connect to localhost:5432
- **DBeaver**: Universal database tool
- **TablePlus**: Modern database GUI

### Sample Queries

```sql
-- View all users
SELECT u.email, p.full_name, p.role 
FROM users u 
JOIN profiles p ON u.id = p.id;

-- View Dr. Johnson's courses
SELECT * FROM courses 
WHERE instructor_id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

-- Check enrollments
SELECT e.*, c.title, p.full_name 
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN profiles p ON e.user_id = p.id;
```

## Production Deployment

For production:

1. Update `appsettings.json` with production database credentials
2. Use environment variables for sensitive data
3. Enable SSL for database connections
4. Set up regular backups
5. Monitor database performance

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify your database connection
4. Ensure all migrations have been run