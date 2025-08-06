import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

let lastCourseId = 0;

async function getLatestCourseId() {
  const result = await pool.query('SELECT MAX(id) as max_id FROM courses');
  return result.rows[0].max_id || 0;
}

async function checkForNewCourse() {
  try {
    const currentMaxId = await getLatestCourseId();
    
    if (currentMaxId > lastCourseId) {
      console.log('\n🎉 NEW COURSE DETECTED! 🎉\n');
      
      // Get the new course details
      const newCourse = await pool.query(`
        SELECT 
          c.*,
          p.full_name as instructor_name,
          p.email as instructor_email
        FROM courses c
        LEFT JOIN profiles p ON c.instructor_id = p.id
        WHERE c.id = $1
      `, [currentMaxId]);
      
      if (newCourse.rows.length > 0) {
        const course = newCourse.rows[0];
        console.log('=== NEW COURSE DETAILS ===');
        console.log(`ID: ${course.id}`);
        console.log(`Title: "${course.title}"`);
        console.log(`Description: "${course.description?.substring(0, 100)}..."`);
        console.log(`Category: ${course.category}`);
        console.log(`Level: ${course.level}`);
        console.log(`Price: $${course.price}`);
        console.log(`Status: ${course.status}`);
        console.log(`Course Type: ${course.course_type}`);
        console.log(`Instructor: ${course.instructor_name} (${course.instructor_email})`);
        console.log(`Created: ${new Date(course.created_at).toLocaleString()}`);
        
        // Check features
        const features = await pool.query(
          'SELECT feature FROM course_features WHERE course_id = $1 ORDER BY display_order',
          [course.id]
        );
        console.log(`\nFeatures (${features.rows.length}):`);
        features.rows.forEach(f => console.log(`  - ${f.feature}`));
        
        // Check tags
        const tags = await pool.query(
          'SELECT tag FROM course_tags WHERE course_id = $1',
          [course.id]
        );
        console.log(`\nTags (${tags.rows.length}):`);
        tags.rows.forEach(t => console.log(`  - ${t.tag}`));
        
        // Check objectives
        const objectives = await pool.query(
          'SELECT objective FROM course_objectives WHERE course_id = $1 ORDER BY display_order',
          [course.id]
        );
        console.log(`\nObjectives (${objectives.rows.length}):`);
        objectives.rows.forEach(o => console.log(`  - ${o.objective}`));
        
        // Check prerequisites
        const prerequisites = await pool.query(
          'SELECT prerequisite_text FROM course_prerequisites WHERE course_id = $1 ORDER BY display_order',
          [course.id]
        );
        console.log(`\nPrerequisites (${prerequisites.rows.length}):`);
        prerequisites.rows.forEach(p => console.log(`  - ${p.prerequisite_text}`));
        
        console.log('\n========================\n');
      }
      
      lastCourseId = currentMaxId;
    }
  } catch (error) {
    console.error('Error checking for new course:', error);
  }
}

async function monitor() {
  console.log('🔍 MONITORING DATABASE FOR NEW COURSES...\n');
  console.log('This script will detect when a new course is created and show its details.');
  console.log('Press Ctrl+C to stop monitoring.\n');
  
  // Get initial max ID
  lastCourseId = await getLatestCourseId();
  console.log(`Current highest course ID: ${lastCourseId}`);
  console.log('Waiting for new courses...\n');
  
  // Check every 2 seconds
  setInterval(checkForNewCourse, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nStopping monitor...');
  await pool.end();
  process.exit(0);
});

// Start monitoring
monitor();