import { Router } from "express";
import { requireTenantRole } from "../middleware/tenant-membership.middleware.js";
import { requireUserAuth } from "../middleware/user-auth.middleware.js";
import { DocumentService } from "../services/document.service.js";

export function createDashboardDocumentRouter(service = new DocumentService()) {
  const router = Router({ mergeParams: true });
  router.use(requireUserAuth);
  router.get("/", requireTenantRole(["owner", "admin", "editor", "viewer"]), async (req, res, next) => { try { res.json({ documents: await service.listForTenant(req.tenantId!) }); } catch (error) { next(error); } });
  router.post("/", requireTenantRole(["owner", "admin", "editor"]), service.upload.single("file"), async (req, res, next) => { try { res.status(202).json(await service.uploadForTenant(req.tenantId!, req.file, req.body.title)); } catch (error) { next(error); } });
  return router;
}
