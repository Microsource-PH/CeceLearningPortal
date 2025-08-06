# Backend Startup Checklist

## Prerequisites
1. **PostgreSQL** must be installed and running
   - Default port: 5432
   - Username: postgres
   - Password: P@ssword!@

2. **.NET 8 SDK** must be installed
   - Check with: `dotnet --version`
   - Download from: https://dotnet.microsoft.com/download/dotnet/8.0

## Common Issues and Solutions

### 1. PostgreSQL Connection Failed
```
Error: 28P01: password authentication failed for user "postgres"
```
**Solution:**
- Make sure PostgreSQL is running
- Verify password is correct: `P@ssword!@`
- Check if database "CeceLearningPortal" exists

### 2. Port Already in Use
```
Error: Address already in use
```
**Solution:**
- Check what's using port 5295: `netstat -ano | findstr :5295`
- Kill the process or change the port in launchSettings.json

### 3. Build Errors
```
Error CS0246: The type or namespace name could not be found
```
**Solution:**
- Run `dotnet restore` to restore packages
- Make sure all project references are correct

### 4. Migration Errors
```
Error: 42P01: relation "AspNetUsers" does not exist
```
**Solution:**
- Create the database first
- Run migrations: `dotnet ef database update`

## Quick Start Commands

### Option 1: PowerShell (Recommended)
```powershell
cd D:\ProductDevelopment\Cece
.\fix-backend-startup.ps1
```

### Option 2: Manual Commands
```bash
# 1. Navigate to backend
cd D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api

# 2. Restore packages
dotnet restore

# 3. Build
dotnet build

# 4. Create/update database
dotnet ef database update

# 5. Run
dotnet run
```

### Option 3: Visual Studio
1. Open `CeceLearningPortal.Backend.sln` in Visual Studio
2. Set `CeceLearningPortal.Api` as startup project
3. Press F5 to run with debugging

## Verify Backend is Running
1. Open browser to: http://localhost:5295/swagger
2. You should see the Swagger API documentation

## If Database Doesn't Exist
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE "CeceLearningPortal";
```

## Environment Variables (if needed)
```
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5295
ConnectionStrings__DefaultConnection=Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=P@ssword!@
```