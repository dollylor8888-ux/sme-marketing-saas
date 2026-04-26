const { neon } = require('@neondatabase/serverless');

const DEST_URL = "postgresql://neondb_owner:npg_o3nwbUEYR9Zz@ep-purple-sun-amqlaxrw-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const dest = neon(DEST_URL);

async function main() {
  console.log("=== Users ===");
  const users = await dest.query(`SELECT id, "clerkId", email, name, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 20`);
  console.log(JSON.stringify(users, null, 2));
  
  console.log("\n=== CreditAccounts ===");
  const credits = await dest.query(`SELECT id, "userId", balance, "createdAt" FROM "CreditAccount" ORDER BY "createdAt" DESC LIMIT 20`);
  console.log(JSON.stringify(credits, null, 2));
  
  console.log("\n=== Total counts ===");
  const counts = await dest.query(`SELECT 
    (SELECT COUNT(*) FROM "User") as user_count,
    (SELECT COUNT(*) FROM "CreditAccount") as credit_count,
    (SELECT COUNT(*) FROM "CreditTransaction") as tx_count,
    (SELECT COUNT(*) FROM "ActionLog") as action_count
  `);
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
