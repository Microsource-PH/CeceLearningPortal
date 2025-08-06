import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function checkSessionsTable() {
  try {
    // Check if sessions table exists
    const sessionsExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      )
    `);
    
    console.log('Sessions table exists:', sessionsExists.rows[0].exists);
    
    if (!sessionsExists.rows[0].exists) {
      console.log('\n❌ Sessions table is missing!');
      console.log('This is likely causing the 500 error on login.');
      console.log('\nCreating sessions table...');
      
      await pool.query(`
        CREATE TABLE sessions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          access_token VARCHAR(255) NOT NULL UNIQUE,
          refresh_token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX idx_sessions_access_token ON sessions(access_token);
        CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
        CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
      `);
      
      console.log('✅ Sessions table created successfully!');
    } else {
      // Show current sessions
      const sessions = await pool.query('SELECT COUNT(*) as count FROM sessions');
      console.log(`Current sessions in table: ${sessions.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSessionsTable();