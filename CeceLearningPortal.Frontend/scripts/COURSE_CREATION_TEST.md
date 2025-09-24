# Course Creation Test Instructions

## Database is now cleaned up! ✅

All duplicate uppercase tables have been removed. The database now uses consistent lowercase naming.

## To test course creation:

1. **Start the monitor** (in one terminal):
   ```bash
   cd "D:\ProductDevelopment\Cece\cece-learningportal-main"
   npx tsx scripts/monitor-course-creation.ts
   ```

2. **Make sure servers are running** (in separate terminals):
   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run server
   ```

3. **Create a course in the UI**:
   - Go to http://localhost:8082
   - Login as a Creator/Instructor user
   - Navigate to course creation
   - Fill in the form with:
     - Title
     - Description
     - Category
     - Add some features
     - Add some tags
   - Click Save

4. **Watch the monitor** - it will show:
   - When the course is created
   - All the normalized data (features, tags, etc.)

5. **If course doesn't save**:
   - Check browser console (F12) for errors
   - Check network tab for failed requests
   - Check backend terminal for errors
   - Make sure your user has Creator or Instructor role

## Common issues:

1. **403 Forbidden**: User doesn't have Creator/Instructor/Admin role
2. **Network error**: Backend server not running
3. **Table not found**: Run the database check script again

## Verify everything is working:
```bash
npx tsx scripts/check-recent-courses.ts
```