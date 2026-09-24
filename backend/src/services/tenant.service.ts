import { randomBytes } from "node:crypto";
import { database, ensureLocalOwner } from "../infrastructure/database.js";
import { hashApiKey } from "../middleware/tenant-api-key.middleware.js";
export class TenantService {
  async create(name: string) {
    const ownerId = await ensureLocalOwner(); const apiKey = `cs_live_${randomBytes(24).toString("base64url")}`; const publicWidgetKey = `cs_widget_${randomBytes(16).toString("base64url")}`;
    const tenant = await database.query<{ id: string; name: string; public_widget_key: string; created_at: string }>("INSERT INTO tenants (owner_id, name, public_widget_key) VALUES ($1, $2, $3) RETURNING id, name, public_widget_key, created_at", [ownerId, name, publicWidgetKey]);
    await database.query("INSERT INTO api_keys (tenant_id, key_prefix, key_hash) VALUES ($1, $2, $3)", [tenant.rows[0].id, apiKey.slice(0, 16), hashApiKey(apiKey)]);
    return { tenant: tenant.rows[0], apiKey, warning: "Save this API key now. ChatStack stores only its hash." };
  }
  async list() { return (await database.query("SELECT id, name, public_widget_key, created_at FROM tenants ORDER BY created_at DESC")).rows; }
}
