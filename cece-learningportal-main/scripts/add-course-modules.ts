import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function addCourseModules() {
  const client = await pool.connect();
  
  try {
    console.log('=== ADDING COURSE MODULES ===\n');
    
    // Check if course 1 exists
    const courseResult = await client.query('SELECT id, title FROM courses WHERE id = 1');
    if (courseResult.rows.length === 0) {
      console.log('Course with ID 1 not found');
      return;
    }
    
    const course = courseResult.rows[0];
    console.log(`Found course: ${course.title}`);
    
    // Check existing modules
    const existingModules = await client.query(
      'SELECT COUNT(*) as count FROM course_modules WHERE course_id = 1'
    );
    console.log(`Existing modules: ${existingModules.rows[0].count}`);
    
    if (existingModules.rows[0].count > 0) {
      console.log('Course already has modules. Skipping...');
      return;
    }
    
    // Add sample modules and lessons
    await client.query('BEGIN');
    
    // Module 1
    const module1Result = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES (1, 'Introduction to Advanced ML', 'Foundations and prerequisites for advanced machine learning', 1, 120)
      RETURNING id
    `);
    const module1Id = module1Result.rows[0].id;
    
    // Add lessons to module 1
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'Welcome to the Course', 'Course overview and objectives', 'video', 'https://example.com/video1', 10, 1, true),
        ($1, 'Setting Up Your Environment', 'Installing required tools and libraries', 'video', 'https://example.com/video2', 15, 2, false),
        ($1, 'Review of ML Fundamentals', 'Quick recap of basic ML concepts', 'video', 'https://example.com/video3', 20, 3, false)
    `, [module1Id]);
    
    // Module 2
    const module2Result = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES (1, 'Deep Learning Architectures', 'Understanding neural networks and deep learning', 2, 180)
      RETURNING id
    `);
    const module2Id = module2Result.rows[0].id;
    
    // Add lessons to module 2
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'Introduction to Neural Networks', 'Basic concepts of neural networks', 'video', 'https://example.com/video4', 30, 1, false),
        ($1, 'Convolutional Neural Networks', 'CNNs for image processing', 'video', 'https://example.com/video5', 45, 2, false),
        ($1, 'Recurrent Neural Networks', 'RNNs for sequential data', 'video', 'https://example.com/video6', 40, 3, false)
    `, [module2Id]);
    
    // Module 3
    const module3Result = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES (1, 'Advanced Techniques', 'State-of-the-art ML techniques', 3, 240)
      RETURNING id
    `);
    const module3Id = module3Result.rows[0].id;
    
    // Add lessons to module 3
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'Transfer Learning', 'Leveraging pre-trained models', 'video', 'https://example.com/video7', 35, 1, false),
        ($1, 'Generative Adversarial Networks', 'Understanding GANs', 'video', 'https://example.com/video8', 50, 2, false),
        ($1, 'Transformer Architecture', 'Modern NLP with transformers', 'video', 'https://example.com/video9', 60, 3, false),
        ($1, 'Final Project', 'Apply your knowledge in a real-world project', 'assignment', 'https://example.com/project', 120, 4, false)
    `, [module3Id]);
    
    await client.query('COMMIT');
    
    console.log('\nSuccessfully added modules and lessons to course 1');
    
    // Verify the additions
    const moduleCount = await client.query(
      'SELECT COUNT(*) as count FROM course_modules WHERE course_id = 1'
    );
    const lessonCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM course_lessons l
      JOIN course_modules m ON l.module_id = m.id
      WHERE m.course_id = 1
    `);
    
    console.log(`Total modules added: ${moduleCount.rows[0].count}`);
    console.log(`Total lessons added: ${lessonCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding modules:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addCourseModules();