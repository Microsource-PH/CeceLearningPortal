import { db, query } from '../server/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSeed() {
  try {
    console.log('Checking existing data...');
    
    // Check if data already exists
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    
    if (userCount[0].count > 0) {
      console.log(`Database already has ${userCount[0].count} users. Skipping seed.`);
      return;
    }
    
    console.log('Running seed migration...');
    
    // Read the seed SQL file
    const seedPath = path.join(__dirname, '..', 'migrations', '002_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Split SQL by semicolons to execute each statement
    const statements = seedSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.query(statement);
        } catch (error) {
          console.error('Error executing statement:', statement.substring(0, 50) + '...');
          console.error(error.message);
        }
      }
    }
    
    console.log('Seed data loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runSeed();