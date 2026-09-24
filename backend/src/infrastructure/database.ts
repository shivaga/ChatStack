import { Pool } from "pg";
import { config } from "../config/app.config.js";
export const database = new Pool({ connectionString: config.database.url, ssl: config.database.useTls ? { rejectUnauthorized: false } : false });
export async function ensureLocalOwner() {
  const result = await database.query<{ id: string }>(`INSERT INTO users (google_id, email, display_name) VALUES ('local-development', 'local@chatstack.dev', 'Local development') ON CONFLICT (google_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id`);
  return result.rows[0].id;
}
