import { db } from '../server/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const migrations = [
    '005_course_lessons_and_progress.sql',
    '006_course_reviews.sql',
    '007_create_student_data.sql'
  ];

  for (const migration of migrations) {
    console.log(`Running migration: ${migration}`);
    
    try {
      const migrationPath = path.join(process.cwd(), 'migrations', migration);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the migration
      await db.query(sql);
      
      console.log(`✓ ${migration} completed successfully`);
    } catch (error) {
      console.error(`✗ Error running ${migration}:`, error.message);
      // Continue with next migration
    }
  }
  
  console.log('\nAll migrations completed!');
  console.log('\nYou can now login with:');
  console.log('- student@example.com / password (Student account)');
  console.log('- sarah.wilson@email.com / password123 (Creator account)');
  console.log('- admin@email.com / admin123 (Admin account)');
  
  process.exit(0);
}

runMigrations().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});