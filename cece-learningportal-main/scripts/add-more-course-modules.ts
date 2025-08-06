import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function addMoreCourseModules() {
  const client = await pool.connect();
  
  try {
    console.log('=== ADDING MODULES TO MORE COURSES ===\n');
    
    // Add modules to React course (ID: 2)
    const reactCourseId = 2;
    console.log('Adding modules to React & TypeScript course...');
    
    await client.query('BEGIN');
    
    // React Module 1
    const reactModule1 = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES ($1, 'React Fundamentals', 'Core concepts of React development', 1, 180)
      RETURNING id
    `, [reactCourseId]);
    
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'Introduction to React', 'What is React and why use it?', 'video', '#', 15, 1, true),
        ($1, 'Components and Props', 'Building blocks of React applications', 'video', '#', 25, 2, false),
        ($1, 'State and Lifecycle', 'Managing component state', 'video', '#', 30, 3, false),
        ($1, 'Handling Events', 'User interactions in React', 'video', '#', 20, 4, false),
        ($1, 'Practice: Build a Counter App', 'Hands-on exercise', 'assignment', '#', 45, 5, false)
    `, [reactModule1.rows[0].id]);
    
    // React Module 2
    const reactModule2 = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES ($1, 'Advanced React Patterns', 'Modern React development techniques', 2, 240)
      RETURNING id
    `, [reactCourseId]);
    
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'React Hooks Deep Dive', 'useState, useEffect, and custom hooks', 'video', '#', 40, 1, false),
        ($1, 'Context API and State Management', 'Global state without Redux', 'video', '#', 35, 2, false),
        ($1, 'Performance Optimization', 'React.memo, useMemo, and useCallback', 'video', '#', 30, 3, false),
        ($1, 'Quiz: React Best Practices', 'Test your knowledge', 'quiz', '#', 20, 4, false)
    `, [reactModule2.rows[0].id]);
    
    // React Module 3
    const reactModule3 = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES ($1, 'TypeScript with React', 'Type-safe React development', 3, 200)
      RETURNING id
    `, [reactCourseId]);
    
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'TypeScript Basics', 'Introduction to TypeScript', 'video', '#', 25, 1, false),
        ($1, 'Typing React Components', 'Props, state, and event types', 'video', '#', 35, 2, false),
        ($1, 'Advanced TypeScript Patterns', 'Generics and utility types', 'video', '#', 40, 3, false),
        ($1, 'Final Project: Todo App', 'Build a fully typed React app', 'assignment', '#', 100, 4, false)
    `, [reactModule3.rows[0].id]);
    
    // Add modules to Python course (ID: 3)
    const pythonCourseId = 3;
    console.log('Adding modules to Python Data Analysis course...');
    
    // Python Module 1
    const pythonModule1 = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES ($1, 'Python Basics for Data Science', 'Essential Python programming', 1, 150)
      RETURNING id
    `, [pythonCourseId]);
    
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'Python Setup and Environment', 'Installing Python and Jupyter', 'video', '#', 20, 1, true),
        ($1, 'Python Data Types and Structures', 'Lists, dictionaries, and more', 'video', '#', 30, 2, false),
        ($1, 'Control Flow and Functions', 'Logic and code organization', 'video', '#', 25, 3, false),
        ($1, 'Working with Files', 'Reading and writing data', 'text', '#', 15, 4, false)
    `, [pythonModule1.rows[0].id]);
    
    // Python Module 2
    const pythonModule2 = await client.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES ($1, 'Data Analysis with Pandas', 'Master data manipulation', 2, 300)
      RETURNING id
    `, [pythonCourseId]);
    
    await client.query(`
      INSERT INTO course_lessons (module_id, title, description, content_type, content_url, duration_minutes, display_order, is_preview)
      VALUES 
        ($1, 'Introduction to Pandas', 'DataFrames and Series', 'video', '#', 35, 1, false),
        ($1, 'Data Cleaning and Preparation', 'Handle missing data and outliers', 'video', '#', 45, 2, false),
        ($1, 'Data Aggregation and Grouping', 'Summarize your data', 'video', '#', 40, 3, false),
        ($1, 'Merging and Joining Data', 'Combine multiple datasets', 'video', '#', 30, 4, false),
        ($1, 'Practice: Analyze Sales Data', 'Real-world exercise', 'assignment', '#', 60, 5, false)
    `, [pythonModule2.rows[0].id]);
    
    await client.query('COMMIT');
    
    console.log('\nSuccessfully added modules to multiple courses!');
    
    // Verify the additions
    const courseStats = await client.query(`
      SELECT 
        c.id,
        c.title,
        COUNT(DISTINCT m.id) as module_count,
        COUNT(DISTINCT l.id) as lesson_count
      FROM courses c
      LEFT JOIN course_modules m ON c.id = m.course_id
      LEFT JOIN course_lessons l ON m.id = l.module_id
      WHERE c.id IN (1, 2, 3)
      GROUP BY c.id, c.title
      ORDER BY c.id
    `);
    
    console.log('\nCourse Statistics:');
    courseStats.rows.forEach(course => {
      console.log(`- ${course.title}: ${course.module_count} modules, ${course.lesson_count} lessons`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding modules:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addMoreCourseModules();