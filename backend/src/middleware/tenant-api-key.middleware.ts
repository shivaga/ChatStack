import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { database } from "../infrastructure/database.js";
declare global { namespace Express { interface Request { tenantId?: string; } } }
export function hashApiKey(key: string) { return createHash("sha256").update(key).digest("hex"); }
export async function requireTenantApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token?.startsWith("cs_live_")) return res.status(401).json({ error: "Provide a tenant key as Authorization: Bearer cs_live_..." });
    const candidate = hashApiKey(token);
    const result = await database.query<{ tenant_id: string; key_hash: string }>("SELECT tenant_id, key_hash FROM api_keys WHERE key_prefix = $1 AND revoked_at IS NULL", [token.slice(0, 16)]);
    const match = result.rows.find(row => timingSafeEqual(Buffer.from(row.key_hash), Buffer.from(candidate)));
    if (!match) return res.status(401).json({ error: "Invalid or revoked tenant API key." });
    req.tenantId = match.tenant_id; next();
  } catch (error) { next(error); }
}
