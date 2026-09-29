import type { NextFunction, Request, Response } from "express";
import { database } from "../infrastructure/database.js";

export type TenantRole = "owner" | "admin" | "editor" | "viewer";

export function requireTenantRole(allowedRoles: TenantRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantParam = req.params.tenantId;
      const tenantId = Array.isArray(tenantParam) ? tenantParam[0] : tenantParam;
      if (!req.userId || !tenantId) return res.status(401).json({ error: "Authentication and a tenant are required." });
      const membership = await database.query<{ role: TenantRole }>("SELECT role FROM tenant_memberships WHERE tenant_id = $1 AND user_id = $2", [tenantId, req.userId]);
      if (!membership.rows[0]) return res.status(403).json({ error: "You do not have access to this tenant." });
      if (!allowedRoles.includes(membership.rows[0].role)) return res.status(403).json({ error: "Your tenant role does not allow this action." });
      req.tenantId = tenantId;
      req.tenantRole = membership.rows[0].role;
      next();
    } catch (error) { next(error); }
  };
}
