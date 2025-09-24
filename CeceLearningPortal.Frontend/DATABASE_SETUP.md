# Database Setup Guide

This guide explains how to set up the database for the Cece Learning Portal with real authentication and data.

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Install Docker (required by Supabase local development)

## Quick Setup

Run the setup script:
```bash
./scripts/setup-database.sh
```

## Manual Setup

1. **Start Supabase locally:**
```bash
supabase start
```

2. **Apply database migrations:**
```bash
supabase db push
```

3. **Seed the database:**
```bash
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

## Environment Variables

Add these to your `.env` file:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get your keys by running:
```bash
supabase status
```

## Test Accounts

All test accounts use the password: `password`

### Admin Account
- Email: admin@example.com
- Role: Admin
- Name: Michael Chen

### Instructor Account
- Email: instructor@example.com  
- Role: Creator
- Name: Dr. Sarah Johnson

### Student Accounts
- Email: student@example.com
- Role: Learner
- Name: John Smith

- Email: alex.chen@example.com
- Role: Learner (Direct purchase student)
- Name: Alex Chen

- Email: sophia.martinez@example.com
- Role: Learner (Premium subscriber)
- Name: Sophia Martinez

## Database Schema

### Auth Tables
- `auth.users` - Core authentication table
- `sessions` - Active user sessions

### Profile Tables
- `profiles` - User profile information
- `user_stats` - Learner statistics
- `instructor_stats` - Creator statistics

### Course Tables
- `courses` - Course catalog
- `enrollments` - Course enrollments
- `transactions` - Purchase history
- `subscriptions` - Active subscriptions
- `certificates` - Earned certificates
- `activities` - User activity log

## Features

1. **Real Authentication**
   - Secure password hashing with bcrypt
   - Session-based authentication
   - Role-based access control

2. **Automatic Data Seeding**
   - Dr. Sarah Johnson as primary instructor
   - Multiple courses with realistic data
   - Student enrollments and progress
   - Transaction history
   - Subscription management

3. **Real-time Statistics**
   - Course performance metrics
   - Revenue calculations
   - Student engagement tracking
   - Platform-wide analytics

## Troubleshooting

### Port conflicts
If port 54321 is already in use:
```bash
supabase stop
supabase start
```

### Database connection issues
Check if Docker is running:
```bash
docker ps
```

### Reset database
To completely reset and reseed:
```bash
supabase db reset
```

## Production Deployment

For production, use Supabase Cloud:

1. Create a project at https://app.supabase.com
2. Run migrations in the SQL editor
3. Update environment variables with production URLs and keys
4. Deploy Edge Functions for authentication