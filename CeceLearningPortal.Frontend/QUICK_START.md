# Quick Start - Database Setup

## Option 1: Using Mock Data (No Database Required)

The application works out of the box with mock data. Just run:

```bash
npm install
npm run dev
```

Login with:
- **Admin**: admin@example.com / password
- **Instructor**: instructor@example.com / password (Dr. Sarah Johnson)
- **Student**: student@example.com / password

## Option 2: Using Real Database (Supabase)

### 1. Local Supabase Setup

First, install Supabase CLI:
```bash
npm install -g supabase
```

Start Supabase locally:
```bash
npx supabase init (if not already initialized)
npx supabase start
```

### 2. Initialize Database

Run the SQL script in Supabase Studio (http://localhost:54323):

1. Go to SQL Editor
2. Copy and paste the contents of `scripts/init-db.sql`
3. Click "Run"

### 3. Configure Environment

Create a `.env` file:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Get your keys:
```bash
npx supabase status
```

### 4. Start the Application

```bash
npm run dev
```

## Option 3: Using Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL script in the SQL Editor
3. Update `.env` with your project URL and anon key
4. Start the application

## Troubleshooting

### "Login failed" Error

This means the app is using mock authentication. Check:
1. Your `.env` file has the correct Supabase URL
2. Supabase is running (`npx supabase status`)

### No Data Showing

1. Make sure you ran the SQL initialization script
2. Check the Supabase Studio to verify data exists
3. Check browser console for any errors

### Reset Everything

```bash
npx supabase db reset
```

Then run the initialization script again.

## Test Accounts

All passwords are: `password`

| Role | Email | Name | Description |
|------|-------|------|-------------|
| Admin | admin@example.com | Michael Chen | Full platform access |
| Creator | instructor@example.com | Dr. Sarah Johnson | Course creator with analytics |
| Learner | student@example.com | John Smith | Student with enrollments |