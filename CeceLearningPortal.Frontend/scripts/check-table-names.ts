import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function checkTableNames() {
  try {
    console.log('=== CHECKING TABLE NAMING CONVENTION ===\n');
    
    // Query to get all table names
    const tablesQuery = `
      SELECT 
        table_name,
        table_schema,
        CASE 
          WHEN table_name != lower(table_name) THEN 'MIXED/UPPER CASE - NEEDS FIX'
          ELSE 'lowercase - OK'
        END as naming_status
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY 
        CASE WHEN table_name != lower(table_name) THEN 0 ELSE 1 END,
        table_name;
    `;
    
    const result = await pool.query(tablesQuery);
    
    console.log('Current tables in database:\n');
    
    let hasIssues = false;
    result.rows.forEach(row => {
      console.log(`Table: ${row.table_name.padEnd(30)} Status: ${row.naming_status}`);
      if (row.naming_status !== 'lowercase - OK') {
        hasIssues = true;
      }
    });
    
    // Check for specific problematic tables
    console.log('\n--- Checking for case-sensitive table access ---\n');
    
    const tableChecks = [
      { quoted: '"Courses"', unquoted: 'courses' },
      { quoted: '"Users"', unquoted: 'users' },
      { quoted: '"Profiles"', unquoted: 'profiles' },
      { quoted: '"Enrollments"', unquoted: 'enrollments' },
      { quoted: '"CourseFeatures"', unquoted: 'course_features' },
      { quoted: '"CourseTags"', unquoted: 'course_tags' }
    ];
    
    for (const check of tableChecks) {
      try {
        // Try quoted name
        await pool.query(`SELECT COUNT(*) FROM ${check.quoted} LIMIT 1`);
        console.log(`❌ Table ${check.quoted} exists with case-sensitive name`);
        hasIssues = true;
      } catch (quotedError) {
        // Try unquoted name
        try {
          await pool.query(`SELECT COUNT(*) FROM ${check.unquoted} LIMIT 1`);
          console.log(`✅ Table ${check.unquoted} exists with lowercase name`);
        } catch (unquotedError) {
          // Table doesn't exist at all
        }
      }
    }
    
    // Check foreign key constraints that might reference mixed-case tables
    console.log('\n--- Checking Foreign Key Constraints ---\n');
    
    const fkQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;
    
    const fkResult = await pool.query(fkQuery);
    
    console.log('Foreign key constraints:');
    fkResult.rows.forEach(row => {
      const hasIssue = row.table_name !== row.table_name.toLowerCase() || 
                      row.foreign_table_name !== row.foreign_table_name.toLowerCase();
      const status = hasIssue ? '❌' : '✅';
      console.log(`${status} ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    
    // Recommendations
    console.log('\n--- RECOMMENDATIONS ---\n');
    
    if (hasIssues) {
      console.log('⚠️  Found tables with mixed/uppercase names!');
      console.log('\nTo fix this issue:');
      console.log('1. Run the migration script:');
      console.log('   psql -U postgres -d CeceLearningPortal -f migrations/003_fix_table_naming_convention.sql\n');
      console.log('2. Or run the TypeScript migration:');
      console.log('   npx tsx scripts/run-naming-migration.ts\n');
      console.log('3. Update all queries in the codebase to use lowercase table names');
    } else {
      console.log('✅ All tables follow lowercase naming convention!');
    }
    
    console.log('\n=== CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error checking table names:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkTableNames();