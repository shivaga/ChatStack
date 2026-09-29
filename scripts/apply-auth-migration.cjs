const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const sql = fs.readFileSync(path.resolve(__dirname, "..", "backend", "db", "auth-migration.sql"), "utf8");
    await client.query(sql);
    const verification = await client.query(`
      SELECT
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_memberships') AS memberships,
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_user_id') AS auth_user_id
    `);
    if (!verification.rows[0].memberships || !verification.rows[0].auth_user_id) throw new Error("Migration verification failed.");
    console.log("Authentication migration applied and verified.");
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.log(`Authentication migration failed: ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
