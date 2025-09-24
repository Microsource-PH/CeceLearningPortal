import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read connection string from appsettings.json
const appsettingsPath = path.join(__dirname, '..', 'appsettings.json');
const appsettings = JSON.parse(fs.readFileSync(appsettingsPath, 'utf8'));
const connectionString = appsettings.ConnectionStrings.CeceLearningPortal;

// Parse connection string
function parseConnectionString(connStr: string) {
  const params: any = {};
  connStr.split(';').forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) {
      params[key.trim()] = value.trim();
    }
  });
  return {
    host: params.Host || 'localhost',
    port: parseInt(params.Port || '5432'),
    database: params.Database || 'postgres',
    user: params.Username || params.User || 'postgres',
    password: params.Password || 'postgres'
  };
}

async function setupDatabase() {
  console.log('Setting up PostgreSQL database for CeceLearningPortal...');
  
  // Parse connection parameters
  const connParams = parseConnectionString(connectionString);
  const dbName = 'CeceLearningPortal';
  
  // First connect to postgres database to create our database
  const client = new Client({
    host: connParams.host,
    port: connParams.port,
    user: connParams.user,
    password: connParams.password,
    database: 'postgres'
  });
  
  try {
    await client.connect();
    
    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
    
    await client.end();
    
    // Now connect to the CeceLearningPortal database
    const dbClient = new Client({
      host: connParams.host,
      port: connParams.port,
      user: connParams.user,
      password: connParams.password,
      database: dbName
    });
    await dbClient.connect();
    
    // Run schema migration
    console.log('Running schema migration...');
    const schemaSql = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '001_create_schema.sql'),
      'utf8'
    );
    await dbClient.query(schemaSql);
    console.log('Schema created successfully');
    
    // Run seed data
    console.log('Seeding initial data...');
    const seedSql = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '002_seed_data.sql'),
      'utf8'
    );
    await dbClient.query(seedSql);
    console.log('Data seeded successfully');
    
    // Verify setup
    const userCount = await dbClient.query('SELECT COUNT(*) FROM users');
    const courseCount = await dbClient.query('SELECT COUNT(*) FROM courses');
    
    console.log(`\nDatabase setup complete!`);
    console.log(`- Users created: ${userCount.rows[0].count}`);
    console.log(`- Courses created: ${courseCount.rows[0].count}`);
    console.log(`\nTest credentials:`);
    console.log('- Admin: admin@example.com / password');
    console.log('- Instructor: instructor@example.com / password (Dr. Sarah Johnson)');
    console.log('- Student: student@example.com / password');
    
    await dbClient.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();