import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/CeceLearningPortal',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database normalization migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/002_normalize_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Start a transaction
    await client.query('BEGIN');
    
    console.log('Creating normalized tables...');
    
    // Split the migration into individual statements
    // This is a simple split - in production you'd want more robust SQL parsing
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await client.query(statement + ';');
        console.log('✓ Executed statement');
      } catch (error) {
        console.error('✗ Failed to execute statement:', error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
        throw error;
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('✓ Migration completed successfully');
    
    // Verify the migration
    console.log('\nVerifying migration results...');
    
    const tables = [
      'course_features',
      'course_tags',
      'course_prerequisites',
      'course_objectives',
      'course_modules',
      'course_lessons',
      'course_reviews',
      'course_categories'
    ];
    
    for (const table of tables) {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );
      
      if (result.rows[0].count > 0) {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✓ Table ${table} exists with ${countResult.rows[0].count} rows`);
      } else {
        console.log(`✗ Table ${table} does not exist`);
      }
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function generateSampleData() {
  const client = await pool.connect();
  
  try {
    console.log('\nGenerating sample data for normalized tables...');
    
    // Get existing courses
    const coursesResult = await client.query('SELECT id, title FROM courses LIMIT 5');
    const courses = coursesResult.rows;
    
    if (courses.length === 0) {
      console.log('No courses found to add sample data to');
      return;
    }
    
    for (const course of courses) {
      console.log(`\nAdding data for course: ${course.title}`);
      
      // Add features if they don't exist
      const featuresResult = await client.query(
        'SELECT COUNT(*) as count FROM course_features WHERE course_id = $1',
        [course.id]
      );
      
      if (featuresResult.rows[0].count === 0) {
        const sampleFeatures = [
          'Lifetime Access',
          'Certificate of Completion',
          'Downloadable Resources',
          'Mobile Access',
          'Q&A Support'
        ];
        
        for (let i = 0; i < sampleFeatures.length; i++) {
          await client.query(
            'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3)',
            [course.id, sampleFeatures[i], i]
          );
        }
        console.log(`  ✓ Added ${sampleFeatures.length} features`);
      }
      
      // Add tags
      const tagsResult = await client.query(
        'SELECT COUNT(*) as count FROM course_tags WHERE course_id = $1',
        [course.id]
      );
      
      if (tagsResult.rows[0].count === 0) {
        const sampleTags = ['beginner-friendly', 'hands-on', 'project-based', 'certification'];
        
        for (const tag of sampleTags) {
          await client.query(
            'INSERT INTO course_tags (course_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [course.id, tag]
          );
        }
        console.log(`  ✓ Added ${sampleTags.length} tags`);
      }
      
      // Add objectives
      const objectivesResult = await client.query(
        'SELECT COUNT(*) as count FROM course_objectives WHERE course_id = $1',
        [course.id]
      );
      
      if (objectivesResult.rows[0].count === 0) {
        const sampleObjectives = [
          'Understand core concepts and fundamentals',
          'Build real-world projects from scratch',
          'Apply best practices and industry standards',
          'Develop problem-solving skills'
        ];
        
        for (let i = 0; i < sampleObjectives.length; i++) {
          await client.query(
            'INSERT INTO course_objectives (course_id, objective, display_order) VALUES ($1, $2, $3)',
            [course.id, sampleObjectives[i], i]
          );
        }
        console.log(`  ✓ Added ${sampleObjectives.length} objectives`);
      }
      
      // Add a module with lessons
      const modulesResult = await client.query(
        'SELECT COUNT(*) as count FROM course_modules WHERE course_id = $1',
        [course.id]
      );
      
      if (modulesResult.rows[0].count === 0) {
        // Create a module
        const moduleResult = await client.query(
          `INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [course.id, 'Introduction', 'Getting started with the course', 0, 60]
        );
        
        const moduleId = moduleResult.rows[0].id;
        console.log(`  ✓ Created module with ID ${moduleId}`);
        
        // Add lessons to the module
        const sampleLessons = [
          { title: 'Course Overview', type: 'video', duration: 10, preview: true },
          { title: 'Setting Up Your Environment', type: 'video', duration: 15, preview: false },
          { title: 'Your First Project', type: 'text', duration: 20, preview: false },
          { title: 'Quick Quiz', type: 'quiz', duration: 15, preview: false }
        ];
        
        for (let i = 0; i < sampleLessons.length; i++) {
          const lesson = sampleLessons[i];
          await client.query(
            `INSERT INTO course_lessons (module_id, title, content_type, duration_minutes, display_order, is_preview) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [moduleId, lesson.title, lesson.type, lesson.duration, i, lesson.preview]
          );
        }
        console.log(`  ✓ Added ${sampleLessons.length} lessons`);
      }
    }
    
    console.log('\n✓ Sample data generation completed');
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  } finally {
    client.release();
  }
}

// Run the migration
runMigration()
  .then(() => generateSampleData())
  .then(() => {
    console.log('\n✓ All migration tasks completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });