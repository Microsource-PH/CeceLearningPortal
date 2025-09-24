# PostgreSQL Setup Help

## Quick Diagnosis

Run this command to test your PostgreSQL connection:
```bash
npx tsx scripts/check-postgres.ts
```

This will:
1. Ask for your PostgreSQL credentials
2. Test the connection
3. Show you the correct connection string for appsettings.json

## Common Issues and Solutions

### 1. Password Authentication Failed

This is the most common issue. Solutions:

**Option A: Update appsettings.json with your actual password**
```json
{
  "ConnectionStrings": {
    "CeceLearningPortal": "Host=localhost;Port=5432;Database=CeceLearningPortal;Username=postgres;Password=YOUR_ACTUAL_PASSWORD"
  }
}
```

**Option B: Reset PostgreSQL password (macOS)**
```bash
# Stop PostgreSQL
brew services stop postgresql

# Start in single-user mode
postgres --single -D /usr/local/var/postgres postgres

# In the postgres prompt, type:
ALTER USER postgres PASSWORD 'postgres';

# Exit and restart
brew services start postgresql
```

**Option C: Create a new user**
```bash
# Connect as superuser (may not need password)
psql -U postgres

# Create new user
CREATE USER ceceuser WITH PASSWORD 'cecepass';
ALTER USER ceceuser CREATEDB;

# Exit
\q
```

Then update appsettings.json:
```json
{
  "ConnectionStrings": {
    "CeceLearningPortal": "Host=localhost;Port=5432;Database=CeceLearningPortal;Username=ceceuser;Password=cecepass"
  }
}
```

### 2. PostgreSQL Not Running

**macOS (Homebrew):**
```bash
# Check status
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql

# Or start manually
pg_ctl -D /usr/local/var/postgres start
```

**Linux:**
```bash
# Check status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

**Windows:**
```bash
# Check status
pg_ctl status -D "C:\Program Files\PostgreSQL\14\data"

# Start PostgreSQL
net start postgresql-x64-14
```

### 3. PostgreSQL Not Installed

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

## Manual Database Setup

If the automated setup doesn't work, you can set up manually:

1. **Connect to PostgreSQL:**
```bash
psql -U postgres
# or
psql -U your_username
```

2. **Create database:**
```sql
CREATE DATABASE "CeceLearningPortal";
\q
```

3. **Run migrations:**
```bash
psql -U postgres -d CeceLearningPortal -f migrations/001_create_schema.sql
psql -U postgres -d CeceLearningPortal -f migrations/002_seed_data.sql
```

## Alternative: Use Docker

If you're having trouble with local PostgreSQL, use Docker:

1. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: CeceLearningPortal
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. **Start PostgreSQL:**
```bash
docker-compose up -d
```

3. **Run setup:**
```bash
npm run db:setup
```

## Still Having Issues?

1. **Check PostgreSQL logs:**
   - macOS: `/usr/local/var/log/postgresql@14.log`
   - Linux: `/var/log/postgresql/postgresql-*.log`
   - Windows: Check Event Viewer

2. **Verify connection manually:**
```bash
psql -h localhost -p 5432 -U postgres -l
```

3. **Use the test script:**
```bash
npx tsx scripts/check-postgres.ts
```

This will help identify the exact connection parameters needed.