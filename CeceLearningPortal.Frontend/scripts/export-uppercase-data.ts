import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function exportUppercaseData() {
  const client = await pool.connect();
  
  try {
    console.log('=== EXPORTING UPPERCASE TABLE DATA ===\n');
    
    // Create export directory
    const exportDir = path.join(process.cwd(), 'database-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportSubDir = path.join(exportDir, `uppercase-tables-${timestamp}`);
    fs.mkdirSync(exportSubDir);
    
    // Tables to export
    const tablesToExport = [
      'Courses',
      'CourseModules',
      'Enrollments',
      'Subscriptions',
      'AspNetUsers',
      'Lessons',
      'Reviews',
      'Payments'
    ];
    
    for (const table of tablesToExport) {
      try {
        console.log(`Exporting "${table}"...`);
        const result = await client.query(`SELECT * FROM "${table}"`);
        
        if (result.rows.length > 0) {
          const filePath = path.join(exportSubDir, `${table}.json`);
          fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
          console.log(`✅ Exported ${result.rows.length} records to ${table}.json`);
        } else {
          console.log(`⏭️  No data in "${table}"`);
        }
      } catch (error) {
        console.log(`❌ Error exporting "${table}": ${error.message}`);
      }
    }
    
    // Create a summary file
    const summaryPath = path.join(exportSubDir, 'EXPORT_SUMMARY.txt');
    const summary = `
Database Export Summary
======================
Export Date: ${new Date().toISOString()}
Database: CeceLearningPortal

This export contains data from uppercase (PascalCase) tables that were
created by an ASP.NET/Entity Framework application.

These tables are being removed to avoid conflicts with the lowercase
tables used by the Node.js application.

Tables Exported:
${tablesToExport.map(t => `- ${t}`).join('\n')}

Note: The data structure is different from the current Node.js schema.
Manual mapping would be required to import this data into the new schema.
`;
    
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`\n✅ Export complete!`);
    console.log(`📁 Data exported to: ${exportSubDir}`);
    
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the export
exportUppercaseData().catch(console.error);