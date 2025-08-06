import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function cleanRefreshTokens() {
  const client = await pool.connect();
  
  try {
    console.log('=== CLEANING REFRESH TOKENS ===\n');
    
    // Check current refresh tokens
    const currentTokens = await client.query(`
      SELECT 
        id, user_id, 
        expires_at,
        revoked_at IS NOT NULL as is_revoked,
        expires_at < NOW() as is_expired,
        created_at
      FROM refresh_tokens 
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${currentTokens.rows.length} refresh tokens:`);
    currentTokens.rows.forEach(token => {
      const status = token.is_revoked ? 'REVOKED' : 
                    token.is_expired ? 'EXPIRED' : 'VALID';
      console.log(`  User ${token.user_id}: ${status} (created: ${token.created_at})`);
    });
    
    // Delete all old/invalid tokens
    const deleteResult = await client.query(`
      DELETE FROM refresh_tokens 
      WHERE revoked_at IS NOT NULL 
         OR expires_at < NOW()
    `);
    
    console.log(`\n✅ Deleted ${deleteResult.rowCount} invalid refresh tokens`);
    
    // For testing, also delete all remaining tokens to force fresh login
    const deleteAllResult = await client.query(`
      DELETE FROM refresh_tokens
    `);
    
    console.log(`✅ Deleted ${deleteAllResult.rowCount} remaining tokens to force fresh login`);
    
    console.log('\n✅ Refresh token cleanup complete!');
    console.log('All users will need to login again to get new tokens.');
    
  } catch (error) {
    console.error('Error cleaning refresh tokens:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the cleanup
cleanRefreshTokens().catch(console.error);