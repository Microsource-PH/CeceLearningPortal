import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function addBestsellerColumn() {
  try {
    // Check if column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name = 'is_bestseller'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the column if it doesn't exist
      await pool.query(`
        ALTER TABLE courses 
        ADD COLUMN is_bestseller BOOLEAN DEFAULT false
      `);
      console.log('Added is_bestseller column to courses table');
    } else {
      console.log('is_bestseller column already exists');
    }
    
    // Set some courses as bestsellers
    const updateResult = await pool.query(`
      UPDATE courses 
      SET is_bestseller = true 
      WHERE id IN (
        SELECT id FROM courses 
        ORDER BY RANDOM() 
        LIMIT 3
      )
    `);
    
    console.log(`Marked ${updateResult.rowCount} courses as bestsellers`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addBestsellerColumn();