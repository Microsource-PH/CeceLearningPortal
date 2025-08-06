import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function restoreUsers() {
  const client = await pool.connect();
  
  try {
    console.log('=== RESTORING USERS ===\n');
    
    // First, check current users
    const currentUsers = await client.query('SELECT id, email FROM users');
    console.log(`Current users in database: ${currentUsers.rows.length}`);
    currentUsers.rows.forEach(u => console.log(`  - ${u.email}`));
    
    // Find the most recent export
    const exportDir = path.join(process.cwd(), 'database-export');
    const exports = fs.readdirSync(exportDir).filter(d => d.startsWith('uppercase-tables-'));
    
    if (exports.length === 0) {
      console.log('\n❌ No export found to restore from');
      return;
    }
    
    // Use the most recent export
    const latestExport = exports.sort().reverse()[0];
    const exportPath = path.join(exportDir, latestExport);
    console.log(`\nRestoring from: ${exportPath}`);
    
    // Load AspNetUsers data
    const aspNetUsersPath = path.join(exportPath, 'AspNetUsers.json');
    if (!fs.existsSync(aspNetUsersPath)) {
      console.log('❌ AspNetUsers.json not found');
      return;
    }
    
    const aspNetUsers = JSON.parse(fs.readFileSync(aspNetUsersPath, 'utf8'));
    console.log(`\nFound ${aspNetUsers.length} users in backup`);
    
    await client.query('BEGIN');
    
    // Common test passwords to try
    const testPasswords = [
      'Password123!',
      'Admin123!',
      'Test123!',
      'password123',
      'admin123'
    ];
    
    for (const aspUser of aspNetUsers) {
      console.log(`\nProcessing user: ${aspUser.Email}`);
      
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [aspUser.Email.toLowerCase()]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`  - User already exists, skipping`);
        continue;
      }
      
      // Create user with a default password
      const defaultPassword = 'Password123!';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      // Insert into users table
      const userResult = await client.query(`
        INSERT INTO users (id, email, encrypted_password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          encrypted_password = EXCLUDED.encrypted_password
        RETURNING id
      `, [
        aspUser.Id,
        aspUser.Email.toLowerCase(),
        hashedPassword,
        aspUser.CreatedAt || new Date(),
        aspUser.UpdatedAt || new Date()
      ]);
      
      // Map ASP.NET roles to our roles
      let mappedRole = 'Learner'; // default
      if (aspUser.Role === 'Admin') mappedRole = 'Admin';
      else if (aspUser.Role === 'Instructor') mappedRole = 'Creator';
      else if (aspUser.Role === 'Creator') mappedRole = 'Creator';
      else if (aspUser.Role === 'Student') mappedRole = 'Learner';
      
      // Insert/update profile
      await client.query(`
        INSERT INTO profiles (
          id, full_name, role, avatar_url, bio, location, 
          phone_number, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role
      `, [
        aspUser.Id,
        aspUser.FullName || aspUser.Email.split('@')[0],
        mappedRole,
        aspUser.AvatarUrl || null,
        aspUser.Bio || null,
        aspUser.Location || null,
        aspUser.PhoneNumber || null,
        'active',
        aspUser.CreatedAt || new Date(),
        aspUser.UpdatedAt || new Date()
      ]);
      
      console.log(`  ✅ Created user with password: ${defaultPassword}`);
    }
    
    // Also ensure we have our standard test users
    console.log('\n--- Ensuring standard test users exist ---');
    
    const testUsers = [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        fullName: 'Admin User',
        role: 'Admin'
      },
      {
        email: 'instructor@example.com',
        password: 'Instructor123!',
        fullName: 'Dr. Sarah Johnson',
        role: 'Creator'
      },
      {
        email: 'student@example.com',
        password: 'Student123!',
        fullName: 'John Doe',
        role: 'Learner'
      },
      {
        email: 'creator@example.com',
        password: 'Creator123!',
        fullName: 'Jane Smith',
        role: 'Creator'
      }
    ];
    
    for (const testUser of testUsers) {
      try {
        // Check if exists
        const exists = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [testUser.email]
        );
        
        if (exists.rows.length === 0) {
          const hashedPassword = await bcrypt.hash(testUser.password, 10);
          
          // Create user
          const userResult = await client.query(`
            INSERT INTO users (email, encrypted_password)
            VALUES ($1, $2)
            RETURNING id
          `, [testUser.email, hashedPassword]);
          
          const userId = userResult.rows[0].id;
          
          // Create profile
          await client.query(`
            INSERT INTO profiles (id, full_name, role, status)
            VALUES ($1, $2, $3, $4)
          `, [userId, testUser.fullName, testUser.role, 'active']);
          
          console.log(`✅ Created test user: ${testUser.email} / ${testUser.password}`);
        } else {
          // Update password for existing user
          const hashedPassword = await bcrypt.hash(testUser.password, 10);
          await client.query(
            'UPDATE users SET encrypted_password = $1 WHERE email = $2',
            [hashedPassword, testUser.email]
          );
          console.log(`✅ Updated password for: ${testUser.email} / ${testUser.password}`);
        }
      } catch (error) {
        console.error(`Error creating test user ${testUser.email}:`, error.message);
      }
    }
    
    await client.query('COMMIT');
    
    // Show final user list
    console.log('\n--- Final User List ---');
    const finalUsers = await client.query(`
      SELECT u.email, p.full_name, p.role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      ORDER BY p.role, u.email
    `);
    
    console.log('\nAll users in database:');
    finalUsers.rows.forEach(u => {
      console.log(`  ${u.email.padEnd(30)} - ${u.full_name?.padEnd(25) || 'No name'} - ${u.role || 'No role'}`);
    });
    
    console.log('\n✅ User restoration complete!');
    console.log('\nYou can now login with these accounts:');
    console.log('  admin@example.com / Admin123!');
    console.log('  instructor@example.com / Instructor123!');
    console.log('  student@example.com / Student123!');
    console.log('  creator@example.com / Creator123!');
    console.log('\nUsers from ASP.NET backup have password: Password123!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error restoring users:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the restoration
restoreUsers().catch(console.error);