import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0].now);
    
    // Test if normalized tables exist and have data
    const featuresCount = await pool.query('SELECT COUNT(*) FROM course_features');
    console.log('Course features count:', featuresCount.rows[0].count);
    
    const tagsCount = await pool.query('SELECT COUNT(*) FROM course_tags');
    console.log('Course tags count:', tagsCount.rows[0].count);
    
    // Test the query used in getCourses
    console.log('\nTesting getCourses query...');
    const coursesQuery = `
      SELECT 
        c.*,
        p.full_name as instructor_name,
        COUNT(DISTINCT e.user_id) as enrolled_students,
        COALESCE(
          (SELECT ARRAY_AGG(feature ORDER BY display_order) 
           FROM course_features 
           WHERE course_id = c.id),
          ARRAY[]::VARCHAR[]
        ) as features,
        COALESCE(
          (SELECT ARRAY_AGG(DISTINCT tag) 
           FROM course_tags 
           WHERE course_id = c.id),
          ARRAY[]::VARCHAR[]
        ) as tags
      FROM courses c
      JOIN profiles p ON c.instructor_id = p.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE 1=1
      GROUP BY c.id, p.full_name
      ORDER BY c.created_at DESC
      LIMIT 1
    `;
    
    const courseResult = await pool.query(coursesQuery);
    if (courseResult.rows.length > 0) {
      const course = courseResult.rows[0];
      console.log('\nFirst course:');
      console.log('- Title:', course.title);
      console.log('- Features:', course.features);
      console.log('- Tags:', course.tags);
      console.log('- Course Type:', course.course_type);
      console.log('- Is Bestseller:', course.is_bestseller);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();