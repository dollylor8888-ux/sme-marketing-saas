const { neon } = require('@neondatabase/serverless');

const SOURCE_URL = "postgresql://neondb_owner:npg_7vONslb0DRIh@ep-winter-sun-aocah5zr-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const DEST_URL = "postgresql://neondb_owner:npg_o3nwbUEYR9Zz@ep-purple-sun-amqlaxrw-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const source = neon(SOURCE_URL);
const dest = neon(DEST_URL);

async function copyTable(tableName) {
  try {
    // Get all rows from source using sql.query for conventional function call
    const rows = await source.query(`SELECT * FROM "${tableName}"`);
    
    if (rows.length === 0) {
      console.log(`  ${tableName}: 0 rows, skipping`);
      return;
    }
    
    const columns = Object.keys(rows[0]);
    console.log(`  ${tableName}: ${rows.length} rows`);
    
    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        return String(val);
      });
      
      try {
        await dest.query(`INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')})`);
      } catch (err) {
        console.log(`    Insert error: ${err.message}`);
      }
    }
    console.log(`  ${tableName}: copied ${rows.length} rows`);
  } catch (err) {
    console.log(`  ${tableName}: ERROR - ${err.message}`);
  }
}

async function main() {
  console.log("=== Check source ===");
  const tables = await source.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
  console.log(`Found ${tables.length} tables`);
  
  console.log("\n=== Check dest ===");
  const destTables = await dest.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
  console.log(`Found ${destTables.length} tables`);
  
  console.log("\n=== Copy data ===");
  for (const t of tables) {
    await copyTable(t.table_name);
  }
  
  console.log("\n=== Done! ===");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
