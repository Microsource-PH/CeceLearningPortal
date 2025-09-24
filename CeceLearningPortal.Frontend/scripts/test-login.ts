import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function testLogin() {
  try {
    console.log('=== TESTING LOGIN PROCESS ===\n');
    
    const testEmail = 'admin@example.com';
    const testPassword = 'Admin123!';
    
    console.log(`Testing login for: ${testEmail}`);
    console.log(`Password: ${testPassword}\n`);
    
    // Step 1: Check if user exists
    console.log('1. Checking if user exists...');
    const userQuery = `
      SELECT u.*, p.full_name, p.role, p.avatar_url
      FROM users u
      JOIN profiles p ON u.id = p.id
      WHERE u.email = $1
    `;
    
    const user = await pool.query(userQuery, [testEmail]);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.rows[0].id,
      email: user.rows[0].email,
      fullName: user.rows[0].full_name,
      role: user.rows[0].role
    });
    
    // Step 2: Check password
    console.log('\n2. Verifying password...');
    const storedPassword = user.rows[0].encrypted_password;
    console.log('Stored password hash exists:', !!storedPassword);
    
    const validPassword = await bcrypt.compare(testPassword, storedPassword);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      console.log('❌ Invalid password');
      return;
    }
    
    // Step 3: Test session creation
    console.log('\n3. Testing session creation...');
    const { v4: uuidv4 } = await import('uuid');
    const accessToken = uuidv4();
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const sessionResult = await pool.query(`
      INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [user.rows[0].id, accessToken, refreshToken, expiresAt]);
    
    console.log('✅ Session created with ID:', sessionResult.rows[0].id);
    
    // Step 4: Test updating last login
    console.log('\n4. Testing last login update...');
    await pool.query(`
      UPDATE profiles SET last_login = NOW() WHERE id = $1
    `, [user.rows[0].id]);
    
    console.log('✅ Last login updated');
    
    console.log('\n✅ LOGIN TEST SUCCESSFUL!');
    console.log('The login process should work. The issue might be:');
    console.log('1. Backend server not running');
    console.log('2. CORS issues');
    console.log('3. Frontend sending wrong data');
    
  } catch (error) {
    console.error('❌ LOGIN TEST FAILED:', error);
  } finally {
    await pool.end();
  }
}

testLogin();