import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function testCourseFeatures() {
  try {
    console.log('=== TESTING COURSE FEATURES ===\n');
    
    // Get the latest created course
    const latestCourse = await pool.query(`
      SELECT 
        c.id, c.title, c.created_at, c.instructor_id,
        p.full_name as instructor_name
      FROM courses c
      LEFT JOIN profiles p ON c.instructor_id = p.id
      ORDER BY c.created_at DESC
      LIMIT 1
    `);
    
    if (latestCourse.rows.length === 0) {
      console.log('No courses found in database');
      return;
    }
    
    const course = latestCourse.rows[0];
    console.log('Latest course:', {
      id: course.id,
      title: course.title,
      instructor: course.instructor_name || 'Unknown',
      instructor_id: course.instructor_id,
      created: course.created_at
    });
    
    // Check features
    console.log('\n--- Checking features ---');
    const features = await pool.query(`
      SELECT * FROM course_features 
      WHERE course_id = $1 
      ORDER BY display_order
    `, [course.id]);
    
    console.log(`Features count: ${features.rows.length}`);
    features.rows.forEach(f => {
      console.log(`  - ${f.feature} (order: ${f.display_order})`);
    });
    
    // Check instructor profile
    console.log('\n--- Checking instructor profile ---');
    if (course.instructor_id) {
      const profile = await pool.query(`
        SELECT p.id, p.full_name, p.role, u.email
        FROM profiles p
        JOIN users u ON p.id = u.id
        WHERE p.id = $1
      `, [course.instructor_id]);
      
      if (profile.rows.length > 0) {
        console.log('Instructor:', profile.rows[0]);
      } else {
        console.log('❌ No profile found for instructor_id:', course.instructor_id);
      }
    } else {
      console.log('❌ Course has no instructor_id!');
    }
    
    // Test marketplace query
    console.log('\n--- Testing marketplace query ---');
    const marketplaceResult = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.instructor_id,
        p.full_name as instructor_name,
        COALESCE(
          (SELECT ARRAY_AGG(feature ORDER BY display_order) 
           FROM course_features 
           WHERE course_id = c.id),
          ARRAY[]::VARCHAR[]
        ) as features
      FROM courses c
      LEFT JOIN profiles p ON c.instructor_id = p.id
      WHERE c.id = $1
    `, [course.id]);
    
    if (marketplaceResult.rows.length > 0) {
      const result = marketplaceResult.rows[0];
      console.log('Marketplace data:', {
        id: result.id,
        title: result.title,
        instructor: result.instructor_name || 'Unknown',
        features: result.features
      });
    }
    
    // Check all courses with missing instructors
    console.log('\n--- Checking for courses with missing instructor names ---');
    const missingInstructors = await pool.query(`
      SELECT 
        c.id, c.title, c.instructor_id,
        p.full_name as instructor_name
      FROM courses c
      LEFT JOIN profiles p ON c.instructor_id = p.id
      WHERE p.full_name IS NULL OR p.full_name = ''
    `);
    
    console.log(`Courses with missing instructors: ${missingInstructors.rows.length}`);
    missingInstructors.rows.forEach(c => {
      console.log(`  - Course #${c.id}: "${c.title}" (instructor_id: ${c.instructor_id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testCourseFeatures();