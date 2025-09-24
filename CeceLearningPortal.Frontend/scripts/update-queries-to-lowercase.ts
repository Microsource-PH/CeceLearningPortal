import * as fs from 'fs';
import * as path from 'path';

// Define table name mappings
const tableMappings: Record<string, string> = {
  // Quoted versions
  '"Users"': 'users',
  '"Profiles"': 'profiles',
  '"Courses"': 'courses',
  '"Enrollments"': 'enrollments',
  '"Transactions"': 'transactions',
  '"Sessions"': 'sessions',
  '"Subscriptions"': 'subscriptions',
  '"CourseFeatures"': 'course_features',
  '"CourseTags"': 'course_tags',
  '"CourseObjectives"': 'course_objectives',
  '"CoursePrerequisites"': 'course_prerequisites',
  '"CourseModules"': 'course_modules',
  '"CourseLessons"': 'course_lessons',
  '"LessonProgress"': 'lesson_progress',
  '"CourseReviews"': 'course_reviews',
  '"ReviewResponses"': 'review_responses',
  '"CourseAnnouncements"': 'course_announcements',
  '"CourseResources"': 'course_resources',
  '"CourseCategories"': 'course_categories',
  '"CourseInstructors"': 'course_instructors',
  '"ProfileSocialLinks"': 'profile_social_links',
  '"UserSkills"': 'user_skills',
  '"Certificates"': 'certificates',
  '"CertificateSkills"': 'certificate_skills',
  '"LearningActivities"': 'learning_activities',
  
  // Unquoted versions that might appear in queries
  'Users': 'users',
  'Profiles': 'profiles',
  'Courses': 'courses',
  'Enrollments': 'enrollments',
  'Transactions': 'transactions',
  'Sessions': 'sessions',
  'Subscriptions': 'subscriptions',
  'CourseFeatures': 'course_features',
  'CourseTags': 'course_tags',
  'CourseObjectives': 'course_objectives',
  'CoursePrerequisites': 'course_prerequisites',
  'CourseModules': 'course_modules',
  'CourseLessons': 'course_lessons',
  'LessonProgress': 'lesson_progress',
  'CourseReviews': 'course_reviews',
  'ReviewResponses': 'review_responses',
  'CourseAnnouncements': 'course_announcements',
  'CourseResources': 'course_resources',
  'CourseCategories': 'course_categories',
  'CourseInstructors': 'course_instructors',
  'ProfileSocialLinks': 'profile_social_links',
  'UserSkills': 'user_skills',
  'Certificates': 'certificates',
  'CertificateSkills': 'certificate_skills',
  'LearningActivities': 'learning_activities'
};

// Directories to search
const searchDirs = [
  'server',
  'src/services',
  'src/pages',
  'src/components',
  'migrations',
  'scripts'
];

// File extensions to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.sql'];

function updateFile(filePath: string, dryRun: boolean = true): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Replace each table name
    for (const [oldName, newName] of Object.entries(tableMappings)) {
      // Create regex patterns for different contexts
      const patterns = [
        // In SQL queries - FROM, JOIN, etc.
        new RegExp(`(FROM|JOIN|INTO|UPDATE|TABLE|REFERENCES)\\s+${oldName.replace(/"/g, '\\"')}`, 'gi'),
        // After INSERT INTO
        new RegExp(`INSERT\\s+INTO\\s+${oldName.replace(/"/g, '\\"')}`, 'gi'),
        // In CREATE TABLE
        new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${oldName.replace(/"/g, '\\"')}`, 'gi'),
        // In ALTER TABLE
        new RegExp(`ALTER\\s+TABLE\\s+${oldName.replace(/"/g, '\\"')}`, 'gi'),
        // In DROP TABLE
        new RegExp(`DROP\\s+TABLE\\s+(IF\\s+EXISTS\\s+)?${oldName.replace(/"/g, '\\"')}`, 'gi'),
      ];
      
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          hasChanges = true;
          content = content.replace(pattern, (match, prefix) => {
            return match.replace(oldName, newName);
          });
        }
      }
    }
    
    if (hasChanges) {
      console.log(`\n📝 File: ${filePath}`);
      
      // Show a preview of changes
      const lines = originalContent.split('\n');
      const newLines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] !== newLines[i]) {
          console.log(`  Line ${i + 1}:`);
          console.log(`    - ${lines[i].trim()}`);
          console.log(`    + ${newLines[i].trim()}`);
        }
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('  ✅ Updated');
      } else {
        console.log('  🔍 (Dry run - no changes made)');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir: string, dryRun: boolean = true): number {
  let updatedCount = 0;
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        updatedCount += processDirectory(fullPath, dryRun);
      } else if (stat.isFile() && fileExtensions.includes(path.extname(item))) {
        if (updateFile(fullPath, dryRun)) {
          updatedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
  
  return updatedCount;
}

// Main execution
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

console.log('=== UPDATING QUERIES TO LOWERCASE TABLE NAMES ===\n');
console.log(dryRun ? '🔍 DRY RUN MODE - No files will be modified' : '✏️  APPLY MODE - Files will be updated');
console.log('Searching in directories:', searchDirs.join(', '));
console.log('File extensions:', fileExtensions.join(', '));
console.log('\n');

let totalUpdated = 0;

for (const dir of searchDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`\nProcessing ${dir}...`);
    totalUpdated += processDirectory(fullPath, dryRun);
  } else {
    console.log(`\n⚠️  Directory not found: ${dir}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Files that need updating: ${totalUpdated}`);

if (dryRun && totalUpdated > 0) {
  console.log('\nTo apply these changes, run:');
  console.log('  npx tsx scripts/update-queries-to-lowercase.ts --apply');
}