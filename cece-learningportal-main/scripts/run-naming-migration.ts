import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function fixTableNaming() {
  const client = await pool.connect();
  
  try {
    console.log('=== FIXING TABLE NAMING CONVENTION ===\n');
    
    await client.query('BEGIN');
    
    // Define all possible mixed-case table names and their lowercase equivalents
    const tableRenames = [
      { from: 'Users', to: 'users' },
      { from: 'Profiles', to: 'profiles' },
      { from: 'Courses', to: 'courses' },
      { from: 'Enrollments', to: 'enrollments' },
      { from: 'Transactions', to: 'transactions' },
      { from: 'Sessions', to: 'sessions' },
      { from: 'Subscriptions', to: 'subscriptions' },
      { from: 'CourseFeatures', to: 'course_features' },
      { from: 'CourseTags', to: 'course_tags' },
      { from: 'CourseObjectives', to: 'course_objectives' },
      { from: 'CoursePrerequisites', to: 'course_prerequisites' },
      { from: 'CourseModules', to: 'course_modules' },
      { from: 'CourseLessons', to: 'course_lessons' },
      { from: 'LessonProgress', to: 'lesson_progress' },
      { from: 'CourseReviews', to: 'course_reviews' },
      { from: 'ReviewResponses', to: 'review_responses' },
      { from: 'CourseAnnouncements', to: 'course_announcements' },
      { from: 'CourseResources', to: 'course_resources' },
      { from: 'CourseCategories', to: 'course_categories' },
      { from: 'CourseInstructors', to: 'course_instructors' },
      { from: 'ProfileSocialLinks', to: 'profile_social_links' },
      { from: 'UserSkills', to: 'user_skills' },
      { from: 'Certificates', to: 'certificates' },
      { from: 'CertificateSkills', to: 'certificate_skills' },
      { from: 'LearningActivities', to: 'learning_activities' }
    ];
    
    for (const rename of tableRenames) {
      try {
        // Check if the mixed-case table exists
        const checkQuery = `
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `;
        
        // Check for quoted (case-sensitive) table name
        const quotedResult = await client.query(checkQuery, [rename.from]);
        const quotedExists = quotedResult.rows[0].exists;
        
        // Check if lowercase version already exists
        const lowercaseResult = await client.query(checkQuery, [rename.to]);
        const lowercaseExists = lowercaseResult.rows[0].exists;
        
        if (quotedExists && !lowercaseExists) {
          // Rename the table
          console.log(`Renaming "${rename.from}" to "${rename.to}"...`);
          
          // Use a temporary name to avoid conflicts
          const tempName = `${rename.to}_temp_${Date.now()}`;
          
          await client.query(`ALTER TABLE "${rename.from}" RENAME TO ${tempName}`);
          await client.query(`ALTER TABLE ${tempName} RENAME TO ${rename.to}`);
          
          console.log(`✅ Successfully renamed "${rename.from}" to "${rename.to}"`);
        } else if (quotedExists && lowercaseExists) {
          console.log(`⚠️  Both "${rename.from}" and "${rename.to}" exist. Manual intervention needed.`);
        } else if (!quotedExists && lowercaseExists) {
          console.log(`✅ Table "${rename.to}" already exists with correct naming`);
        } else {
          // Table doesn't exist at all, skip
        }
      } catch (error) {
        console.error(`Error processing table ${rename.from}:`, error.message);
      }
    }
    
    // Update any views that might reference the old table names
    console.log('\n--- Checking for views that need updating ---');
    
    const viewsQuery = `
      SELECT viewname, definition
      FROM pg_views
      WHERE schemaname = 'public'
    `;
    
    const viewsResult = await client.query(viewsQuery);
    
    for (const view of viewsResult.rows) {
      let needsUpdate = false;
      for (const rename of tableRenames) {
        if (view.definition.includes(`"${rename.from}"`)) {
          needsUpdate = true;
          console.log(`⚠️  View "${view.viewname}" references "${rename.from}" - needs manual update`);
        }
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Table naming convention fix completed!');
    
    // Run a final check
    console.log('\n--- Final Table List ---');
    const finalCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    finalCheck.rows.forEach(row => {
      const status = row.table_name === row.table_name.toLowerCase() ? '✅' : '❌';
      console.log(`${status} ${row.table_name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
fixTableNaming().catch(console.error);