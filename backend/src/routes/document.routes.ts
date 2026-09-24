import { Router } from "express";
import { requireTenantApiKey } from "../middleware/tenant-api-key.middleware.js";
import { DocumentService } from "../services/document.service.js";
export function createDocumentRouter(service = new DocumentService()) {
  const router = Router();
  router.post("/", requireTenantApiKey, service.upload.single("file"), async (req, res, next) => { try { res.status(202).json(await service.uploadForTenant(req.tenantId!, req.file, req.body.title)); } catch (error) { next(error); } });
  router.get("/", requireTenantApiKey, async (req, res, next) => { try { res.json({ documents: await service.listForTenant(req.tenantId!) }); } catch (error) { next(error); } });
  return router;
}
