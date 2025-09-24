import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function checkRecentCourses() {
  try {
    console.log('=== RECENT COURSE ACTIVITY CHECK ===\n');
    
    // 1. Check courses created in the last 24 hours
    console.log('--- Courses Created in Last 24 Hours ---');
    const recentCourses = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.created_at,
        c.status,
        c.price,
        c.category,
        c.level,
        c.course_type,
        p.full_name as instructor_name,
        u.email as instructor_email,
        p.role as instructor_role
      FROM courses c
      LEFT JOIN profiles p ON c.instructor_id = p.id
      LEFT JOIN users u ON p.id = u.id
      WHERE c.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY c.created_at DESC
    `);
    
    if (recentCourses.rows.length === 0) {
      console.log('No courses created in the last 24 hours.\n');
    } else {
      console.log(`Found ${recentCourses.rows.length} course(s) created in the last 24 hours:\n`);
      
      for (const course of recentCourses.rows) {
        console.log(`Course ID: ${course.id}`);
        console.log(`Title: "${course.title}"`);
        console.log(`Created: ${new Date(course.created_at).toLocaleString()}`);
        console.log(`Status: ${course.status}`);
        console.log(`Price: $${course.price}`);
        console.log(`Category: ${course.category}`);
        console.log(`Level: ${course.level}`);
        console.log(`Type: ${course.course_type || 'Not specified'}`);
        console.log(`Instructor: ${course.instructor_name} (${course.instructor_email})`);
        console.log(`Instructor Role: ${course.instructor_role}`);
        console.log('---');
      }
    }
    
    // 2. Check courses created today
    console.log('\n--- Courses Created Today ---');
    const todayCourses = await pool.query(`
      SELECT COUNT(*) as count
      FROM courses
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    console.log(`Total courses created today: ${todayCourses.rows[0].count}`);
    
    // 3. Check users who can create courses
    console.log('\n--- Users Who Can Create Courses ---');
    const creators = await pool.query(`
      SELECT 
        p.id,
        p.full_name,
        u.email,
        p.role,
        COUNT(c.id) as course_count
      FROM profiles p
      LEFT JOIN users u ON p.id = u.id
      LEFT JOIN courses c ON p.id = c.instructor_id
      WHERE p.role IN ('Creator', 'Instructor', 'Admin')
      GROUP BY p.id, p.full_name, u.email, p.role
      ORDER BY course_count DESC
    `);
    
    console.log('Users with course creation privileges:');
    creators.rows.forEach(creator => {
      console.log(`- ${creator.full_name} (${creator.email}) - Role: ${creator.role}, Courses: ${creator.course_count}`);
    });
    
    // 4. Check for any failed course creation attempts (courses with minimal data)
    console.log('\n--- Potential Failed Course Creations ---');
    const incompleteCourses = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.created_at,
        c.status,
        CASE 
          WHEN cf.course_id IS NULL THEN 'No features'
          ELSE 'Has features'
        END as feature_status,
        CASE 
          WHEN ct.course_id IS NULL THEN 'No tags'
          ELSE 'Has tags'
        END as tag_status
      FROM courses c
      LEFT JOIN (SELECT DISTINCT course_id FROM course_features) cf ON c.id = cf.course_id
      LEFT JOIN (SELECT DISTINCT course_id FROM course_tags) ct ON c.id = ct.course_id
      WHERE c.created_at > NOW() - INTERVAL '7 days'
        AND (cf.course_id IS NULL OR ct.course_id IS NULL)
      ORDER BY c.created_at DESC
      LIMIT 10
    `);
    
    if (incompleteCourses.rows.length > 0) {
      console.log('Courses created recently without features or tags:');
      incompleteCourses.rows.forEach(course => {
        console.log(`- ID: ${course.id}, Title: "${course.title}", Created: ${new Date(course.created_at).toLocaleString()}, ${course.feature_status}, ${course.tag_status}`);
      });
    } else {
      console.log('All recent courses have both features and tags.');
    }
    
    // 5. Check the latest course with full details
    console.log('\n--- Latest Course Full Details ---');
    const latestCourse = await pool.query(`
      SELECT * FROM courses
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (latestCourse.rows.length > 0) {
      const course = latestCourse.rows[0];
      console.log('Latest course in database:');
      console.log(`ID: ${course.id}`);
      console.log(`Title: "${course.title}"`);
      console.log(`Description: "${course.description?.substring(0, 100)}..."`);
      console.log(`Created: ${new Date(course.created_at).toLocaleString()}`);
      
      // Get all related data
      const features = await pool.query('SELECT * FROM course_features WHERE course_id = $1', [course.id]);
      const tags = await pool.query('SELECT * FROM course_tags WHERE course_id = $1', [course.id]);
      const objectives = await pool.query('SELECT * FROM course_objectives WHERE course_id = $1', [course.id]);
      
      console.log(`Features: ${features.rows.map(f => f.feature).join(', ') || 'None'}`);
      console.log(`Tags: ${tags.rows.map(t => t.tag).join(', ') || 'None'}`);
      console.log(`Objectives: ${objectives.rows.length} objective(s)`);
    }
    
    console.log('\n=== CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error checking recent courses:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkRecentCourses();