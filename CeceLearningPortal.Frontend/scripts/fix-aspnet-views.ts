import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function fixAspNetViews() {
  const client = await pool.connect();
  
  try {
    console.log('=== FIXING ASP.NET COMPATIBILITY VIEWS ===\n');
    
    // Drop and recreate AspNetUsers view with all expected columns
    console.log('1. Recreating AspNetUsers view...');
    await client.query(`DROP VIEW IF EXISTS "AspNetUsers" CASCADE`);
    
    await client.query(`
      CREATE VIEW "AspNetUsers" AS
      SELECT 
        u.id as "Id",
        u.email as "Email",
        u.email as "UserName", 
        UPPER(u.email) as "NormalizedUserName",
        UPPER(u.email) as "NormalizedEmail",
        true as "EmailConfirmed",
        u.encrypted_password as "PasswordHash",
        '' as "SecurityStamp",
        '' as "ConcurrencyStamp",
        p.phone_number as "PhoneNumber",
        false as "PhoneNumberConfirmed",
        false as "TwoFactorEnabled",
        null::timestamp as "LockoutEnd",
        false as "LockoutEnabled",
        0 as "AccessFailedCount",
        p.full_name as "FullName",
        p.role as "Role",
        p.avatar_url as "Avatar",
        p.bio as "Bio",
        p.location as "Location",
        p.status as "Status",
        u.created_at as "CreatedAt",
        u.updated_at as "UpdatedAt",
        p.last_login as "LastLogin"
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
    `);
    
    console.log('✅ AspNetUsers view recreated');
    
    // Also ensure Profiles view has Avatar column
    console.log('2. Recreating Profiles view...');
    await client.query(`DROP VIEW IF EXISTS "Profiles" CASCADE`);
    
    await client.query(`
      CREATE VIEW "Profiles" AS 
      SELECT 
        id as "Id",
        full_name as "FullName", 
        role as "Role",
        avatar_url as "Avatar",
        avatar_url as "AvatarUrl",
        bio as "Bio",
        location as "Location", 
        phone_number as "PhoneNumber",
        status as "Status",
        created_at as "CreatedAt",
        updated_at as "UpdatedAt",
        last_login as "LastLogin"
      FROM profiles
    `);
    
    console.log('✅ Profiles view recreated');
    
    // Test the views
    console.log('\n3. Testing views...');
    
    const aspNetUsersTest = await client.query(`
      SELECT "Id", "Email", "FullName", "Role", "Avatar" 
      FROM "AspNetUsers" 
      LIMIT 1
    `);
    
    if (aspNetUsersTest.rows.length > 0) {
      console.log('✅ AspNetUsers view working:', {
        Id: aspNetUsersTest.rows[0].Id,
        Email: aspNetUsersTest.rows[0].Email,
        FullName: aspNetUsersTest.rows[0].FullName,
        Role: aspNetUsersTest.rows[0].Role,
        Avatar: aspNetUsersTest.rows[0].Avatar
      });
    }
    
    const profilesTest = await client.query(`
      SELECT "Id", "FullName", "Role", "Avatar" 
      FROM "Profiles" 
      LIMIT 1
    `);
    
    if (profilesTest.rows.length > 0) {
      console.log('✅ Profiles view working:', {
        Id: profilesTest.rows[0].Id,
        FullName: profilesTest.rows[0].FullName,
        Role: profilesTest.rows[0].Role,
        Avatar: profilesTest.rows[0].Avatar
      });
    }
    
    console.log('\n✅ ASP.NET compatibility views fixed!');
    console.log('The ASP.NET backend should now be able to access Avatar columns.');
    
  } catch (error) {
    console.error('Error fixing ASP.NET views:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixAspNetViews().catch(console.error);