import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function createRefreshTokensTable() {
  const client = await pool.connect();
  
  try {
    console.log('=== CREATING REFRESH TOKENS TABLE ===\n');
    
    // Check if lowercase version exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'refresh_tokens'
      )
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✅ Table refresh_tokens already exists');
      return;
    }
    
    // Create the refresh_tokens table with structure expected by ASP.NET
    await client.query(`
      CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(450) NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        revoked_at TIMESTAMP WITH TIME ZONE,
        replaced_by_token VARCHAR(500),
        device_info TEXT,
        ip_address VARCHAR(45)
      );
      
      -- Create indexes
      CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
    `);
    
    console.log('✅ Created refresh_tokens table');
    
    // Also create a view with uppercase name for compatibility
    await client.query(`
      CREATE OR REPLACE VIEW "RefreshTokens" AS 
      SELECT 
        id as "Id",
        user_id as "UserId",
        token as "Token",
        expires_at as "ExpiresAt",
        created_at as "CreatedAt",
        revoked_at as "RevokedAt",
        replaced_by_token as "ReplacedByToken",
        device_info as "DeviceInfo",
        ip_address as "IpAddress"
      FROM refresh_tokens;
    `);
    
    console.log('✅ Created "RefreshTokens" view for ASP.NET compatibility');
    
  } catch (error) {
    console.error('Error creating refresh_tokens table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the creation
createRefreshTokensTable().catch(console.error);