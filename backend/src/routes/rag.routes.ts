import { Router } from "express";
import { z } from "zod";
import { requireTenantApiKey } from "../middleware/tenant-api-key.middleware.js";
import { RetrievalService } from "../services/retrieval.service.js";
export function createRagRouter(service = new RetrievalService()) {
  const router = Router();
  router.post("/search", requireTenantApiKey, async (req, res, next) => { try { const { query, limit } = z.object({ query: z.string().trim().min(1).max(8_000), limit: z.number().int().min(1).max(12).default(6) }).parse(req.body); res.json({ results: await service.search(req.tenantId!, query, limit) }); } catch (error) { next(error); } });
  router.post("/chat", requireTenantApiKey, async (req, res, next) => { try { const { question } = z.object({ question: z.string().trim().min(1).max(8_000) }).parse(req.body); res.json(await service.answer(req.tenantId!, question)); } catch (error) { next(error); } });
  return router;
}
