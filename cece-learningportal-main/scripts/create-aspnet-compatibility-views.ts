import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function createCompatibilityViews() {
  const client = await pool.connect();
  
  try {
    console.log('=== CREATING ASP.NET COMPATIBILITY VIEWS ===\n');
    
    // Create views that map lowercase tables to uppercase names for ASP.NET
    const viewMappings = [
      {
        view: '"Courses"',
        table: 'courses',
        mappings: `
          id as "Id",
          title as "Title",
          description as "Description",
          instructor_id as "InstructorId",
          price as "Price",
          original_price as "OriginalPrice",
          duration as "Duration",
          level as "Level",
          category as "Category",
          thumbnail as "Thumbnail",
          status as "Status",
          course_type as "CourseType",
          is_bestseller as "IsBestseller",
          created_at as "CreatedAt",
          updated_at as "UpdatedAt"
        `
      },
      {
        view: '"Enrollments"',
        table: 'enrollments',
        mappings: `
          id as "Id",
          user_id as "StudentId",
          course_id as "CourseId",
          enrolled_at as "EnrolledAt",
          progress as "Progress",
          status as "Status",
          completed_at as "CompletedAt",
          created_at as "CreatedAt",
          updated_at as "UpdatedAt"
        `
      },
      {
        view: '"Subscriptions"',
        table: 'subscriptions',
        mappings: `
          id as "Id",
          user_id as "UserId",
          plan_id as "SubscriptionPlanId",
          status as "Status",
          start_date as "StartDate",
          expires_at as "EndDate",
          amount as "Amount",
          created_at as "CreatedAt",
          updated_at as "UpdatedAt"
        `
      },
      {
        view: '"Users"',
        table: 'users',
        mappings: `
          id as "Id",
          email as "Email",
          encrypted_password as "PasswordHash",
          created_at as "CreatedAt",
          updated_at as "UpdatedAt"
        `
      },
      {
        view: '"Profiles"',
        table: 'profiles',
        mappings: `
          id as "Id",
          full_name as "FullName",
          role as "Role",
          avatar_url as "AvatarUrl",
          bio as "Bio",
          location as "Location",
          phone_number as "PhoneNumber",
          status as "Status",
          created_at as "CreatedAt",
          updated_at as "UpdatedAt"
        `
      }
    ];
    
    for (const mapping of viewMappings) {
      try {
        // Drop existing view if it exists
        await client.query(`DROP VIEW IF EXISTS ${mapping.view} CASCADE`);
        
        // Create the view
        const createViewQuery = `
          CREATE VIEW ${mapping.view} AS 
          SELECT ${mapping.mappings}
          FROM ${mapping.table}
        `;
        
        await client.query(createViewQuery);
        console.log(`✅ Created view ${mapping.view} -> ${mapping.table}`);
      } catch (error) {
        console.error(`❌ Error creating view ${mapping.view}:`, error.message);
      }
    }
    
    // Create AspNetUsers view that combines users and profiles
    try {
      await client.query(`DROP VIEW IF EXISTS "AspNetUsers" CASCADE`);
      
      await client.query(`
        CREATE VIEW "AspNetUsers" AS
        SELECT 
          u.id as "Id",
          u.email as "Email",
          u.email as "UserName",
          u.email as "NormalizedUserName",
          u.email as "NormalizedEmail",
          true as "EmailConfirmed",
          u.encrypted_password as "PasswordHash",
          '' as "SecurityStamp",
          '' as "ConcurrencyStamp",
          '' as "PhoneNumber",
          false as "PhoneNumberConfirmed",
          false as "TwoFactorEnabled",
          null::timestamp as "LockoutEnd",
          false as "LockoutEnabled",
          0 as "AccessFailedCount",
          p.full_name as "FullName",
          p.role as "Role"
        FROM users u
        LEFT JOIN profiles p ON u.id = p.id
      `);
      
      console.log('✅ Created view "AspNetUsers"');
    } catch (error) {
      console.error('❌ Error creating AspNetUsers view:', error.message);
    }
    
    console.log('\n✅ Compatibility views created!');
    console.log('\nNote: These are READ-ONLY views. The ASP.NET backend can read data');
    console.log('but should not attempt to INSERT/UPDATE/DELETE through these views.');
    
  } catch (error) {
    console.error('Error creating compatibility views:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the creation
createCompatibilityViews().catch(console.error);