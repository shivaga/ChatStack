import { Router } from "express";
import { z } from "zod";
import { requireTenantRole } from "../middleware/tenant-membership.middleware.js";
import { requireUserAuth } from "../middleware/user-auth.middleware.js";
import { RetrievalService } from "../services/retrieval.service.js";

export function createDashboardRagRouter(service = new RetrievalService()) {
  const router = Router({ mergeParams: true });
  router.use(requireUserAuth, requireTenantRole(["owner", "admin", "editor", "viewer"]));
  router.post("/search", async (req, res, next) => { try { const { query, limit } = z.object({ query: z.string().trim().min(1).max(8_000), limit: z.number().int().min(1).max(12).default(6) }).parse(req.body); res.json({ results: await service.search(req.tenantId!, query, limit) }); } catch (error) { next(error); } });
  router.post("/chat", async (req, res, next) => { try { const { question } = z.object({ question: z.string().trim().min(1).max(8_000) }).parse(req.body); res.json(await service.answer(req.tenantId!, question)); } catch (error) { next(error); } });
  return router;
}
