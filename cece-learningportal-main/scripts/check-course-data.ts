import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function checkCourseData() {
  try {
    console.log('=== DATABASE COURSE DATA CHECK ===\n');
    
    // 1. Check total courses
    const coursesResult = await pool.query('SELECT COUNT(*) as count FROM courses');
    console.log(`Total courses in database: ${coursesResult.rows[0].count}`);
    
    // 2. Get latest 5 courses
    console.log('\n--- Latest 5 Courses ---');
    const latestCourses = await pool.query(`
      SELECT 
        c.id, 
        c.title, 
        c.created_at,
        c.status,
        c.course_type,
        c.instructor_id,
        p.full_name as instructor_name
      FROM courses c
      LEFT JOIN profiles p ON c.instructor_id = p.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);
    
    for (const course of latestCourses.rows) {
      console.log(`\nCourse ID: ${course.id}`);
      console.log(`Title: ${course.title}`);
      console.log(`Created: ${new Date(course.created_at).toLocaleString()}`);
      console.log(`Status: ${course.status}`);
      console.log(`Type: ${course.course_type || 'Not set'}`);
      console.log(`Instructor: ${course.instructor_name || 'Unknown'} (ID: ${course.instructor_id})`);
      
      // Check features for this course
      const featuresResult = await pool.query(
        'SELECT feature, display_order FROM course_features WHERE course_id = $1 ORDER BY display_order',
        [course.id]
      );
      
      if (featuresResult.rows.length > 0) {
        console.log('Features:');
        featuresResult.rows.forEach(f => {
          console.log(`  - ${f.feature} (order: ${f.display_order})`);
        });
      } else {
        console.log('Features: None');
      }
      
      // Check tags
      const tagsResult = await pool.query(
        'SELECT tag FROM course_tags WHERE course_id = $1',
        [course.id]
      );
      
      if (tagsResult.rows.length > 0) {
        console.log(`Tags: ${tagsResult.rows.map(t => t.tag).join(', ')}`);
      } else {
        console.log('Tags: None');
      }
      
      // Check objectives
      const objectivesResult = await pool.query(
        'SELECT objective FROM course_objectives WHERE course_id = $1 ORDER BY display_order',
        [course.id]
      );
      
      if (objectivesResult.rows.length > 0) {
        console.log('Objectives:');
        objectivesResult.rows.forEach(o => {
          console.log(`  - ${o.objective}`);
        });
      } else {
        console.log('Objectives: None');
      }
      
      // Check modules
      const modulesResult = await pool.query(
        'SELECT COUNT(*) as count FROM course_modules WHERE course_id = $1',
        [course.id]
      );
      console.log(`Modules: ${modulesResult.rows[0].count}`);
    }
    
    // 3. Check normalized data statistics
    console.log('\n--- Normalized Data Statistics ---');
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM course_features) as total_features,
        (SELECT COUNT(*) FROM course_tags) as total_tags,
        (SELECT COUNT(*) FROM course_objectives) as total_objectives,
        (SELECT COUNT(*) FROM course_prerequisites) as total_prerequisites,
        (SELECT COUNT(*) FROM course_modules) as total_modules,
        (SELECT COUNT(*) FROM course_lessons) as total_lessons,
        (SELECT COUNT(*) FROM course_reviews) as total_reviews
    `);
    
    const s = stats.rows[0];
    console.log(`Total features across all courses: ${s.total_features}`);
    console.log(`Total tags: ${s.total_tags}`);
    console.log(`Total objectives: ${s.total_objectives}`);
    console.log(`Total prerequisites: ${s.total_prerequisites}`);
    console.log(`Total modules: ${s.total_modules}`);
    console.log(`Total lessons: ${s.total_lessons}`);
    console.log(`Total reviews: ${s.total_reviews}`);
    
    // 4. Check for courses without features
    console.log('\n--- Data Quality Check ---');
    
    const coursesWithoutFeatures = await pool.query(`
      SELECT COUNT(*) as count
      FROM courses c
      WHERE NOT EXISTS (
        SELECT 1 FROM course_features cf WHERE cf.course_id = c.id
      )
    `);
    
    console.log(`Courses without features: ${coursesWithoutFeatures.rows[0].count}`);
    
    const coursesWithoutTags = await pool.query(`
      SELECT COUNT(*) as count
      FROM courses c
      WHERE NOT EXISTS (
        SELECT 1 FROM course_tags ct WHERE ct.course_id = c.id
      )
    `);
    
    console.log(`Courses without tags: ${coursesWithoutTags.rows[0].count}`);
    
    // 5. Check for orphaned data
    const orphanedFeatures = await pool.query(`
      SELECT COUNT(*) as count
      FROM course_features cf
      WHERE NOT EXISTS (
        SELECT 1 FROM courses c WHERE c.id = cf.course_id
      )
    `);
    
    console.log(`Orphaned features (no parent course): ${orphanedFeatures.rows[0].count}`);
    
    // 6. Search for specific course by title (if provided as argument)
    const searchTitle = process.argv[2];
    if (searchTitle) {
      console.log(`\n--- Searching for courses with title containing: "${searchTitle}" ---`);
      
      const searchResult = await pool.query(`
        SELECT c.id, c.title, c.created_at, p.full_name as instructor
        FROM courses c
        LEFT JOIN profiles p ON c.instructor_id = p.id
        WHERE c.title ILIKE $1
        ORDER BY c.created_at DESC
      `, [`%${searchTitle}%`]);
      
      if (searchResult.rows.length > 0) {
        console.log(`Found ${searchResult.rows.length} courses:`);
        searchResult.rows.forEach(course => {
          console.log(`- ID: ${course.id}, Title: "${course.title}", Instructor: ${course.instructor}, Created: ${new Date(course.created_at).toLocaleString()}`);
        });
      } else {
        console.log('No courses found with that title.');
      }
    }
    
    console.log('\n=== CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error checking course data:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkCourseData();

// Usage instructions
console.log('\nUsage:');
console.log('- Run without arguments to see general statistics');
console.log('- Run with a search term to find specific courses: npx tsx scripts/check-course-data.ts "Machine Learning"');