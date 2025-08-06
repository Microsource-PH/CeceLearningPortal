import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function migrateUppercaseData() {
  const client = await pool.connect();
  
  try {
    console.log('=== MIGRATING DATA FROM UPPERCASE TO LOWERCASE TABLES ===\n');
    
    await client.query('BEGIN');
    
    // 1. First, we need to handle the user ID mismatch
    // AspNetUsers uses string IDs, while users uses UUID
    console.log('--- Checking user ID compatibility ---');
    
    const aspNetUsersCheck = await client.query(`
      SELECT COUNT(*) as count FROM "AspNetUsers"
    `);
    console.log(`AspNetUsers count: ${aspNetUsersCheck.rows[0].count}`);
    
    const usersCheck = await client.query(`
      SELECT COUNT(*) as count FROM users
    `);
    console.log(`users count: ${usersCheck.rows[0].count}`);
    
    // 2. Migrate Courses data
    console.log('\n--- Migrating Courses data ---');
    
    // First, let's see what courses exist in uppercase that don't exist in lowercase
    const uniqueUppercaseCourses = await client.query(`
      SELECT c.* 
      FROM "Courses" c
      WHERE NOT EXISTS (
        SELECT 1 FROM courses lc 
        WHERE lc.title = c."Title"
      )
      LIMIT 10
    `);
    
    console.log(`Found ${uniqueUppercaseCourses.rows.length} unique courses in uppercase table`);
    
    if (uniqueUppercaseCourses.rows.length > 0) {
      console.log('\nSample uppercase course structure:');
      console.log(Object.keys(uniqueUppercaseCourses.rows[0]));
      
      // Check if we can map the instructor IDs
      for (const course of uniqueUppercaseCourses.rows.slice(0, 3)) {
        console.log(`\nCourse: ${course.Title}`);
        console.log(`InstructorId: ${course.InstructorId}`);
        console.log(`Price: ${course.Price}`);
        console.log(`Status: ${course.Status}`);
      }
    }
    
    // 3. Check CourseModules
    console.log('\n--- Checking CourseModules ---');
    const courseModulesData = await client.query(`
      SELECT * FROM "CourseModules" LIMIT 5
    `);
    
    if (courseModulesData.rows.length > 0) {
      console.log(`Found ${courseModulesData.rows.length} modules in uppercase table`);
      console.log('Sample module:', courseModulesData.rows[0]);
    }
    
    // 4. Create a mapping strategy
    console.log('\n--- Migration Strategy ---');
    console.log('The uppercase tables use different schemas:');
    console.log('- AspNetUsers (string IDs) vs users (UUID)');
    console.log('- Different column names (Title vs title, InstructorId vs instructor_id)');
    console.log('- Different data types and structures');
    
    console.log('\nOptions:');
    console.log('1. Export uppercase data to JSON for manual review');
    console.log('2. Create new courses in lowercase table with proper mapping');
    console.log('3. Keep only the lowercase tables (recommended if data is test data)');
    
    await client.query('ROLLBACK');
    
    console.log('\n✅ Analysis complete - no changes made');
    console.log('\nRecommendation: Since the uppercase tables appear to be from a different');
    console.log('application (ASP.NET with Entity Framework), and we have data in the');
    console.log('lowercase tables, it\'s best to:');
    console.log('1. Export any important data from uppercase tables');
    console.log('2. Use only the lowercase tables going forward');
    console.log('3. Drop the uppercase tables to avoid confusion');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration analysis failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration analysis
migrateUppercaseData().catch(console.error);