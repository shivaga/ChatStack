import { Router } from "express";
import { z } from "zod";
import { TenantService } from "../services/tenant.service.js";
export function createTenantRouter(service = new TenantService()) {
  const router = Router();
  router.post("/", async (req, res, next) => { try { const { name } = z.object({ name: z.string().trim().min(2).max(80) }).parse(req.body); res.status(201).json(await service.create(name)); } catch (error) { next(error); } });
  router.get("/", async (_req, res, next) => { try { res.json({ tenants: await service.list() }); } catch (error) { next(error); } });
  return router;
}
