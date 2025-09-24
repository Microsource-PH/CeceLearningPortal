# Cece Backup Transfer Documentation

## Purpose
This folder transfer is necessary to consolidate service files from the old backup into the main project structure, ensuring all dependencies are correctly referenced for the React frontend and .NET backend. Based on code analysis, the services layer is critical for API communication, course management, and authentication, and must be properly integrated to maintain build functionality and runtime performance.

## Folder Structure Overview

### Old Backup Location
`C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/Old backup`

**Critical Files Requiring Special Handling:**
- `api.ts` - Core API service with token refresh logic
- `courseService.ts` - Course management service with TypeScript interfaces
- `uploadService.ts` - File upload functionality
- `package.json` - Frontend dependencies and scripts
- `eslint.config.js` - ESLint configuration for TypeScript and React

### New Folder Location
`C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/new folder`

**Critical Files Requiring Special Handling:**
- `.csproj` files - .NET project references
- `appsettings.json` - Backend configuration
- `launchSettings.json` - IIS and debug profiles
- Any database migration files

## Transfer Steps

### 1. Move Old Backup Files to Services Directory
```bash
# Move all files from Old backup to services directory
mv "C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/Old backup/*" "C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/cece-learningportal-main/src/services/" --preserve-structure
```

### 2. Merge New Folder into Main Project
```bash
# Merge new folder contents into cece-learningportal-main
cp -r "C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/new folder/"* "C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/cece-learningportal-main/" --no-clobber
```

### 3. Update File References
**In `api.ts` (update import paths):**
```typescript
// Update any relative paths that might have changed
import { courseService } from './courseService';
// Ensure all imports use correct relative paths from new location
```

**In `courseService.ts` (update API endpoints):**
```typescript
// Verify API endpoints point to correct backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// Ensure all fetch calls use proper URLs
```

**In configuration files:**
- Update `vite.config.ts` if any alias paths changed
- Check `tailwind.config.ts` for content paths
- Verify `tsconfig.json` include/exclude patterns

## Verification Steps

### 1. Frontend Build Verification
```bash
cd "C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/cece-learningportal-main"
npm run lint    # Verify ESLint works
npm run build   # Verify build succeeds
npm run dev     # Verify development server starts
```

### 2. Backend Project Validation
- Open `.csproj` files and verify all project references are intact
- Check that all NuGet package references are correct
- Ensure database connection strings in `appsettings.json` are valid

### 3. Service Functionality Test
- Test API calls from frontend services
- Verify authentication token refresh mechanism
- Confirm course management operations work correctly

## Notes

- **Exclusion Criteria:** Do not transfer any files containing `istanbul` or `mocha` in their names or content, as these are test-related files not needed for production.
- **Absolute Paths:** All operations must use absolute paths to avoid workspace context issues.
- **No Overwrites:** Use `--no-clobber` flag to prevent overwriting existing files during merge.
- **Duplicate Check:** After transfer, verify no duplicate files exist in destination directories using:
  ```bash
  find "C:/Users/Win11/Downloads/Cece-20250805T084305Z-1-001/Cece/Cece-master/cece-learningportal-main/src/services" -name "*" -type f | sort | uniq -d
  ```

**Completion Time:** This transfer should be completed within 15 minutes to minimize downtime.