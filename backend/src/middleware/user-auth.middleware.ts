import type { NextFunction, Request, Response } from "express";
import { database } from "../infrastructure/database.js";
import { supabaseAuth } from "../infrastructure/supabase.auth.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      authUser?: { id: string; email: string; displayName: string };
      tenantRole?: "owner" | "admin" | "editor" | "viewer";
    }
  }
}

export async function requireUserAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token || token.startsWith("cs_live_")) return res.status(401).json({ error: "Sign in to access the dashboard." });
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user?.email) return res.status(401).json({ error: "Your session is invalid or expired. Sign in again." });

    const displayName = String(data.user.user_metadata.full_name ?? data.user.user_metadata.name ?? data.user.email.split("@")[0]);
    const profile = await database.query<{ id: string }>(
      `INSERT INTO users (auth_user_id, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET
         auth_user_id = COALESCE(users.auth_user_id, EXCLUDED.auth_user_id),
         display_name = EXCLUDED.display_name
       RETURNING id`,
      [data.user.id, data.user.email, displayName],
    );
    req.userId = profile.rows[0].id;
    req.authUser = { id: data.user.id, email: data.user.email, displayName };
    next();
  } catch (error) { next(error); }
}
