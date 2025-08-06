import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function checkRoleConstraint() {
  try {
    // Check the constraint
    const constraintQuery = `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'profiles' 
        AND tc.constraint_type = 'CHECK'
        AND tc.constraint_name = 'profiles_role_check';
    `;
    
    const result = await pool.query(constraintQuery);
    
    console.log('Role constraint on profiles table:');
    if (result.rows.length > 0) {
      console.log(result.rows[0].check_clause);
    }
    
    // Check current roles
    const rolesQuery = `
      SELECT DISTINCT role, COUNT(*) as count 
      FROM profiles 
      WHERE role IS NOT NULL 
      GROUP BY role 
      ORDER BY role
    `;
    
    const rolesResult = await pool.query(rolesQuery);
    console.log('\nCurrent roles in database:');
    rolesResult.rows.forEach(r => {
      console.log(`  ${r.role}: ${r.count} users`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkRoleConstraint();