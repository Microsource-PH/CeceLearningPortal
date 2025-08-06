import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function cleanupDuplicateTables() {
  const client = await pool.connect();
  
  try {
    console.log('=== CLEANING UP DUPLICATE TABLES ===\n');
    
    // First, let's check which tables have duplicates
    const duplicateCheck = [
      { uppercase: 'Courses', lowercase: 'courses' },
      { uppercase: 'Enrollments', lowercase: 'enrollments' },
      { uppercase: 'Subscriptions', lowercase: 'subscriptions' },
      { uppercase: 'CourseModules', lowercase: 'course_modules' }
    ];
    
    console.log('--- Checking for data in duplicate tables ---\n');
    
    for (const dup of duplicateCheck) {
      try {
        // Check uppercase table
        const upperResult = await client.query(`SELECT COUNT(*) as count FROM "${dup.uppercase}"`);
        const upperCount = upperResult.rows[0].count;
        
        // Check lowercase table
        const lowerResult = await client.query(`SELECT COUNT(*) as count FROM ${dup.lowercase}`);
        const lowerCount = lowerResult.rows[0].count;
        
        console.log(`${dup.uppercase} (uppercase): ${upperCount} records`);
        console.log(`${dup.lowercase} (lowercase): ${lowerCount} records`);
        
        if (parseInt(upperCount) > 0 && parseInt(lowerCount) === 0) {
          console.log(`⚠️  WARNING: Uppercase table has data but lowercase is empty!`);
        }
        
        console.log('---');
      } catch (error) {
        console.log(`Error checking ${dup.uppercase}/${dup.lowercase}: ${error.message}`);
      }
    }
    
    // Ask for confirmation
    console.log('\n⚠️  IMPORTANT: This script will drop all uppercase/PascalCase tables.');
    console.log('Make sure you have backed up any important data!\n');
    console.log('To proceed, run with --force flag: npx tsx scripts/cleanup-duplicate-tables.ts --force\n');
    
    if (!process.argv.includes('--force')) {
      return;
    }
    
    console.log('🚨 PROCEEDING WITH CLEANUP...\n');
    
    await client.query('BEGIN');
    
    // List of all uppercase tables to drop
    const tablesToDrop = [
      'AspNetRoleClaims',
      'AspNetRoles',
      'AspNetUserClaims',
      'AspNetUserLogins',
      'AspNetUserRoles',
      'AspNetUserTokens',
      'AspNetUsers',
      'CourseApprovals',
      'CourseModules',
      'Courses',
      'Enrollments',
      'InstructorApprovals',
      'LessonProgresses',
      'Lessons',
      'Notifications',
      'PasswordHistories',
      'Payments',
      'RefreshTokens',
      'Reviews',
      'SubscriptionPlans',
      'Subscriptions',
      '__EFMigrationsHistory'
    ];
    
    // Drop foreign key constraints first
    console.log('--- Dropping foreign key constraints ---');
    
    const fkQuery = `
      SELECT
        tc.table_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = ANY($1::text[])
    `;
    
    const fkResult = await client.query(fkQuery, [tablesToDrop]);
    
    for (const fk of fkResult.rows) {
      try {
        console.log(`Dropping constraint ${fk.constraint_name} on ${fk.table_name}`);
        await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}"`);
      } catch (error) {
        console.log(`Error dropping constraint: ${error.message}`);
      }
    }
    
    // Now drop the tables
    console.log('\n--- Dropping uppercase tables ---');
    
    for (const table of tablesToDrop) {
      try {
        console.log(`Dropping table "${table}"...`);
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`✅ Dropped "${table}"`);
      } catch (error) {
        console.log(`❌ Error dropping "${table}": ${error.message}`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Cleanup completed!');
    
    // Show remaining tables
    console.log('\n--- Remaining tables ---');
    const remainingTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    remainingTables.rows.forEach(row => {
      const status = row.table_name === row.table_name.toLowerCase() ? '✅' : '❌';
      console.log(`${status} ${row.table_name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cleanup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the cleanup
cleanupDuplicateTables().catch(console.error);