import { randomBytes } from "node:crypto";
import { database } from "../infrastructure/database.js";
import { hashApiKey } from "../middleware/tenant-api-key.middleware.js";
export class TenantService {
  async create(ownerId: string, name: string) {
    const client = await database.connect();
    const apiKey = `cs_live_${randomBytes(24).toString("base64url")}`;
    const publicWidgetKey = `cs_widget_${randomBytes(16).toString("base64url")}`;
    try {
      await client.query("BEGIN");
      const tenant = await client.query<{ id: string; name: string; public_widget_key: string; created_at: string }>("INSERT INTO tenants (owner_id, name, public_widget_key) VALUES ($1, $2, $3) RETURNING id, name, public_widget_key, created_at", [ownerId, name, publicWidgetKey]);
      await client.query("INSERT INTO tenant_memberships (tenant_id, user_id, role) VALUES ($1, $2, 'owner')", [tenant.rows[0].id, ownerId]);
      await client.query("INSERT INTO api_keys (tenant_id, key_prefix, key_hash) VALUES ($1, $2, $3)", [tenant.rows[0].id, apiKey.slice(0, 16), hashApiKey(apiKey)]);
      await client.query("COMMIT");
      return { tenant: { ...tenant.rows[0], role: "owner" }, apiKey, warning: "This integration API key is shown once. Dashboard access uses your signed-in account." };
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  async list(userId: string) { return (await database.query("SELECT tenants.id, tenants.name, tenants.public_widget_key, tenants.created_at, tenant_memberships.role FROM tenant_memberships JOIN tenants ON tenants.id = tenant_memberships.tenant_id WHERE tenant_memberships.user_id = $1 ORDER BY tenants.created_at DESC", [userId])).rows; }
}
