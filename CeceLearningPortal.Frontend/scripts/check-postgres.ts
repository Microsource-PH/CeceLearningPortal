import { Client } from 'pg';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function checkPostgreSQL() {
  console.log('PostgreSQL Connection Test\n');
  
  try {
    // Get connection details from user
    const host = await question('PostgreSQL Host (default: localhost): ') || 'localhost';
    const port = await question('PostgreSQL Port (default: 5432): ') || '5432';
    const username = await question('PostgreSQL Username (default: postgres): ') || 'postgres';
    const password = await question('PostgreSQL Password: ');
    
    console.log('\nTesting connection...');
    
    // Test connection
    const client = new Client({
      host,
      port: parseInt(port),
      user: username,
      password,
      database: 'postgres'
    });
    
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL!');
    
    // Check if CeceLearningPortal database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'CeceLearningPortal'"
    );
    
    if (dbCheck.rows.length > 0) {
      console.log('✓ CeceLearningPortal database already exists');
    } else {
      console.log('✗ CeceLearningPortal database does not exist yet');
    }
    
    await client.end();
    
    // Update appsettings.json
    console.log('\nUpdate your appsettings.json with:');
    console.log(`{
  "ConnectionStrings": {
    "CeceLearningPortal": "Host=${host};Port=${port};Database=CeceLearningPortal;Username=${username};Password=${password}"
  }
}`);
    
  } catch (error) {
    console.error('\n✗ Connection failed:', error.message);
    console.log('\nPlease ensure:');
    console.log('1. PostgreSQL is installed and running');
    console.log('2. The username and password are correct');
    console.log('3. PostgreSQL is accepting connections on the specified host and port');
  } finally {
    rl.close();
  }
}

checkPostgreSQL();