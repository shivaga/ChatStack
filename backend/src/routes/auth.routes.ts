import { Router } from "express";
import { requireUserAuth } from "../middleware/user-auth.middleware.js";

export function createAuthRouter() {
  const router = Router();
  router.get("/me", requireUserAuth, (req, res) => res.json({ user: req.authUser }));
  return router;
}
